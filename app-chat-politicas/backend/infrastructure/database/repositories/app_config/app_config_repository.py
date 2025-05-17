import httpx
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from fastapi import HTTPException

from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app import LoginRequest, LoginResponse, ActionResponse, UserPermissionsResponse, Action, Role
from domain.app_config.entities.app_log import AppLog, TermsAcceptanceRequest, TermsAcceptanceResponse, AppConfigResponse
from constants import settings
from infrastructure.services.redis import RedisService


class AppConfigRepository(AppConfigRepositoryInterface):
    """Implementación del repositorio de configuración de la aplicación"""

    async def login(self, login_data: LoginRequest) -> Optional[LoginResponse]:
        """Realiza el login a través del servicio ACL externo"""
        async with httpx.AsyncClient(verify=False) as client:
            try:
                response = await client.post(
                    f"{settings.SYNC_ACL_URL}/authorization/login",
                    json={
                        "secret": settings.SYNC_ACL_SECRET,
                        "applicationName": settings.SYNC_ACL_APPLICATION_NAME,
                        "workEmail": login_data.workEmail,
                    },
                    headers={"Content-Type": "application/json", "Accept": "application/json"},
                )

                # Si la respuesta es exitosa
                response.raise_for_status()
                data = response.json()
                # Guardar el token en Redis usando el email como clave
                if "token" in data:
                    await RedisService.save_token(email=login_data.workEmail, token=data["token"], expiration_time=settings.REDIS_TOKEN_EXPIRY)

                    return LoginResponse(token=data["token"])
                else:
                    return None
            except Exception as e:
                print(f"Error durante login: {str(e)}")
                return None

    async def get_app_config(self, user_email: str) -> AppConfigResponse:
        """Obtiene la configuración de la aplicación para un usuario"""
        # Realizar login para obtener token
        login_response = await self.login(LoginRequest(workEmail=user_email))

        if login_response is None:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Verificar si el usuario ha aceptado los términos
        terms_accepted = False
        terms_acceptance_date = None

        # Buscar en la base de datos si el usuario ha aceptado los términos
        app_log = await AppLog.find_one({"user_email": user_email, "action": "accept_terms", "details.accepted": True}, sort=[("timestamp", -1)])

        if app_log:
            terms_accepted = True
            terms_acceptance_date = app_log.timestamp

        # Configurar la respuesta
        return AppConfigResponse(
            requests_last_24_hours=0,  # Este valor podría calcularse en base a los registros
            max_requests_per_ip=settings.MAX_REQUEST_PER_IP,
            terms_accepted=terms_accepted,
            terms_acceptance_date=terms_acceptance_date,
            token=login_response.token,
        )

    async def accept_terms(self, terms_request: TermsAcceptanceRequest, user_email: str) -> TermsAcceptanceResponse:
        """Registra la aceptación de términos de un usuario"""
        if not terms_request.accepted:
            return TermsAcceptanceResponse(accepted=False, timestamp=datetime.now())

        # Registrar en la base de datos
        app_log = AppLog(
            user_email=user_email,
            action="accept_terms",
            endpoint="/app-config/accept-terms",
            details={"accepted": True},
            timestamp=datetime.now(),
        )

        await app_log.insert()

        return TermsAcceptanceResponse(accepted=True, timestamp=app_log.timestamp)

    async def get_actions_by_user(self, user_and_token: Tuple[str, str]) -> UserPermissionsResponse:
        """Obtiene las acciones disponibles para un usuario con estructura jerárquica de roles y acciones"""
        _, token = user_and_token

        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(
                f"{settings.SYNC_ACL_URL}/public/actions",
                headers={"Authorization": token, "Content-Type": "application/json", "Accept": "application/json"},
            )

            # Si la respuesta es exitosa
            response.raise_for_status()
            data = response.json()

            # Crear respuesta jerárquica manteniendo la relación entre roles y acciones
            roles = []

            # Procesar el array de resultados que contiene información de roles
            if "results" in data and isinstance(data["results"], list):
                for role_data in data["results"]:
                    # Solo incluir roles activos
                    if role_data.get("active", False) and "roleName" in role_data:
                        actions = []

                        # Extraer acciones del rol
                        if "actions" in role_data and isinstance(role_data["actions"], list):
                            for action_data in role_data["actions"]:
                                if action_data.get("active", True):
                                    actions.append(
                                        Action(
                                            action_id=action_data.get("actionId", 0),
                                            action_name=action_data.get("actionName", ""),
                                            description=action_data.get("description", ""),
                                            is_function=action_data.get("isFunction", False),
                                            active=action_data.get("active", True),
                                        )
                                    )

                        # Crear el objeto de rol con sus acciones
                        roles.append(
                            Role(
                                role_id=role_data.get("roleId", 0),
                                role_name=role_data.get("roleName", ""),
                                active=role_data.get("active", True),
                                actions=actions,
                            )
                        )

            # Si no se encuentran roles, asignar un rol por defecto
            if not roles:
                roles = [Role(role_id=0, role_name="user", active=True, actions=[])]

            return UserPermissionsResponse(roles=roles)

    # Método de compatibilidad con la versión anterior
    async def get_actions_by_user_legacy(self, user_and_token: Tuple[str, str]) -> ActionResponse:
        """Obtiene las acciones disponibles para un usuario (formato plano anterior)"""
        permissions = await self.get_actions_by_user(user_and_token)

        # Extraer nombres de roles
        roles = [role.role_name.lower() for role in permissions.roles if role.active]

        # Extraer nombres de acciones
        actions = [action.action_name for action in permissions.all_actions]

        return ActionResponse(actions=actions, roles=roles)

    async def log_action(self, app_log: AppLog) -> AppLog:
        """Registra una acción en el log de la aplicación"""
        await app_log.insert()
        return app_log
