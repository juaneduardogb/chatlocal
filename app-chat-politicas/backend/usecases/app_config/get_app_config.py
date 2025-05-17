from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app_log import AppConfigResponse


class GetAppConfigUseCase:
    """Caso de uso para obtener la configuración de la aplicación"""

    def __init__(self, repository: AppConfigRepositoryInterface):
        self.repository = repository

    async def execute(self, user_email: str) -> AppConfigResponse:
        """
        Ejecuta el caso de uso para obtener la configuración de la aplicación

        Args:
            user_email: Email del usuario

        Returns:
            Configuración de la aplicación
        """
        return await self.repository.get_app_config(user_email)
