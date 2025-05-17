from typing import Optional
from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app import LoginRequest, LoginResponse


class LoginUseCase:
    """Caso de uso para iniciar sesión"""

    def __init__(self, repository: AppConfigRepositoryInterface):
        self.repository = repository

    async def execute(self, login_data: LoginRequest) -> Optional[LoginResponse]:
        """
        Ejecuta el caso de uso para iniciar sesión

        Args:
            login_data: Datos de inicio de sesión

        Returns:
            Respuesta del inicio de sesión o None si falla
        """
        return await self.repository.login(login_data)
