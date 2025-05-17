import asyncio
from datetime import datetime, timedelta
from typing import Optional, List, Any, Tuple

from fastapi import APIRouter, Body, HTTPException, Request, Depends, Header
from middlewares.rate_limit import limiter, request_timestamps
from middlewares.auth import get_current_user_and_token
from domain.app_config.entities.app_log import AppLog, TermsAcceptanceRequest, TermsAcceptanceResponse, AppConfigResponse
from domain.app_config.entities.app import LoginRequest, LoginResponse, UserPermissionsResponse
from constants import settings

from infrastructure.database.repositories.app_config.app_config_repository import AppConfigRepository

from usecases.app_config.get_app_config import GetAppConfigUseCase
from usecases.app_config.accept_terms import AcceptTermsUseCase
from usecases.app_config.get_user_actions import GetUserActionsUseCase
from usecases.app_config.login import LoginUseCase
from usecases.app_config.log_action import LogActionUseCase

app_config_router = APIRouter(tags=["App Configuration"])

# Crear el repositorio
app_config_repository = AppConfigRepository()


@app_config_router.get("/config", response_model=AppConfigResponse)
async def get_app_config(user_email: str):
    """
    Obtiene la configuración de la aplicación para un usuario específico, incluyendo:
    - Número de solicitudes realizadas en las últimas 24 horas
    - Número máximo de solicitudes permitidas por IP
    - Si el usuario ha aceptado los términos y condiciones
    """
    # Crear el caso de uso
    get_app_config_use_case = GetAppConfigUseCase(app_config_repository)

    # try:
    # Ejecutar el caso de uso
    return await get_app_config_use_case.execute(user_email)
    # except HTTPException as e:
    #     # Re-lanzar la excepción si proviene del caso de uso
    #     raise e
    # except Exception as e:
    #     # Manejar cualquier otra excepción
    #     raise HTTPException(status_code=500, detail=f"Error al obtener la configuración: {str(e)}")


@app_config_router.post("/accept-terms", response_model=TermsAcceptanceResponse)
async def accept_terms(
    terms_request: TermsAcceptanceRequest = Body(...),
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
):
    """
    Registra la aceptación de los términos y condiciones por parte de un usuario.
    """
    try:
        # Extraer email del usuario del token
        user_email, _ = user_and_token

        # Crear solicitud completa con el email obtenido del token
        complete_request = TermsAcceptanceRequest(accepted=terms_request.accepted)

        # Crear el caso de uso
        accept_terms_use_case = AcceptTermsUseCase(app_config_repository)

        # Ejecutar el caso de uso con el correo del usuario
        return await accept_terms_use_case.execute(complete_request, user_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la aceptación de términos: {str(e)}")


@app_config_router.get("/user/actions")
async def get_actions_by_user(user_and_token: Tuple[str, str] = Depends(get_current_user_and_token), legacy_format: bool = False):
    """
    Obtiene las acciones disponibles para un usuario a través del servicio ACL.
    Requiere autenticación mediante token en el header Authorization.

    Args:
        user_and_token: Tupla (email, token) del usuario obtenida del token
        legacy_format: Si es True, devuelve el formato plano anterior de roles y acciones

    Returns:
        Si legacy_format es True: ActionResponse (formato plano)
        Si legacy_format es False: UserPermissionsResponse (formato jerárquico)
    """
    try:
        # Crear el caso de uso
        get_user_actions_use_case = GetUserActionsUseCase(app_config_repository)

        # Ejecutar el caso de uso
        return await get_user_actions_use_case.execute(user_and_token, legacy_format)
    except Exception as e:
        # Manejar otros tipos de errores
        raise HTTPException(status_code=500, detail={"message": f"Error inesperado: {str(e)}"})


@app_config_router.post("/log", response_model=AppLog)
async def log_action(
    app_log: AppLog,
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
):
    """
    Registra una acción en el log de la aplicación.
    """
    try:
        # Verificar que el usuario del token coincida con el de la solicitud
        user_email, _ = user_and_token
        if app_log.user_email != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para registrar acciones por otro usuario")

        # Crear el caso de uso
        log_action_use_case = LogActionUseCase(app_config_repository)

        # Ejecutar el caso de uso
        return await log_action_use_case.execute(app_log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar la acción: {str(e)}")


@app_config_router.post("/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """
    Inicia sesión del usuario en el sistema ACL y devuelve un token JWT.
    Este token debe ser utilizado para las solicitudes subsiguientes.
    """
    try:
        # Crear el caso de uso
        login_use_case = LoginUseCase(app_config_repository)

        # Ejecutar el caso de uso
        response = await login_use_case.execute(login_request)

        if not response:
            raise HTTPException(status_code=401, detail="No se pudo iniciar sesión. Verifique sus credenciales.")

        return response
    except Exception as e:
        # Manejar cualquier otra excepción
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {str(e)}")
