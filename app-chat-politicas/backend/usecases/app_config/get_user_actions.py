from typing import Tuple, Optional
from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app import ActionResponse, UserPermissionsResponse


class GetUserActionsUseCase:
    """Caso de uso para obtener las acciones disponibles para un usuario"""

    def __init__(self, repository: AppConfigRepositoryInterface):
        self.repository = repository

    async def execute(self, user_and_token: Tuple[str, str], legacy_format: bool = False) -> UserPermissionsResponse | ActionResponse:
        """
        Ejecuta el caso de uso para obtener las acciones disponibles para un usuario

        Args:
            user_and_token: Tupla (email, token) del usuario
            legacy_format: Si es True, devuelve el formato plano anterior de roles y acciones

        Returns:
            Si legacy_format es True: ActionResponse (formato plano)
            Si legacy_format es False: UserPermissionsResponse (formato jerárquico)
        """
        if legacy_format:
            return await self.repository.get_actions_by_user_legacy(user_and_token)
        else:
            return await self.repository.get_actions_by_user(user_and_token)
