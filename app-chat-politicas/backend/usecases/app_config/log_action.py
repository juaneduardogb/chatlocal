from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app_log import AppLog


class LogActionUseCase:
    """Caso de uso para registrar acciones en el log de la aplicación"""

    def __init__(self, repository: AppConfigRepositoryInterface):
        self.repository = repository

    async def execute(self, app_log: AppLog) -> AppLog:
        """
        Ejecuta el caso de uso para registrar una acción en el log

        Args:
            app_log: Log de la acción a registrar

        Returns:
            Log de la acción registrada
        """
        return await self.repository.log_action(app_log)
