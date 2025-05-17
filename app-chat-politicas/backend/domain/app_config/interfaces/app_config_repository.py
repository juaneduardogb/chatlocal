from abc import ABC, abstractmethod
from typing import Optional, Tuple, List

from domain.app_config.entities.app import LoginRequest, LoginResponse, ActionResponse, UserPermissionsResponse
from domain.app_config.entities.app_log import AppLog, TermsAcceptanceRequest, TermsAcceptanceResponse, AppConfigResponse


class AppConfigRepositoryInterface(ABC):
    """Interfaz para el repositorio de configuración de la aplicación"""

    @abstractmethod
    async def login(self, login_data: LoginRequest) -> Optional[LoginResponse]:
        """
        Realiza el login a través del servicio ACL externo

        Args:
            login_data: Datos de login del usuario

        Returns:
            Respuesta del login o None si falla
        """
        pass

    @abstractmethod
    async def get_app_config(self, user_email: str) -> AppConfigResponse:
        """
        Obtiene la configuración de la aplicación para un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Configuración de la aplicación
        """
        pass

    @abstractmethod
    async def accept_terms(self, terms_request: TermsAcceptanceRequest, user_email: str) -> TermsAcceptanceResponse:
        """
        Registra la aceptación de términos de un usuario

        Args:
            terms_request: Solicitud de aceptación de términos
            user_email: Email del usuario obtenido del token

        Returns:
            Respuesta de la aceptación de términos
        """
        pass

    @abstractmethod
    async def get_actions_by_user(self, user_and_token: Tuple[str, str]) -> UserPermissionsResponse:
        """
        Obtiene las acciones disponibles para un usuario con estructura jerárquica de roles y acciones

        Args:
            user_and_token: Tupla (email, token) del usuario

        Returns:
            Respuesta con la estructura jerárquica de roles y acciones disponibles
        """
        pass

    @abstractmethod
    async def get_actions_by_user_legacy(self, user_and_token: Tuple[str, str]) -> ActionResponse:
        """
        Obtiene las acciones disponibles para un usuario en formato plano (compatibilidad)

        Args:
            user_and_token: Tupla (email, token) del usuario

        Returns:
            Respuesta con las acciones disponibles en formato plano
        """
        pass

    @abstractmethod
    async def log_action(self, app_log: AppLog) -> AppLog:
        """
        Registra una acción en el log de la aplicación

        Args:
            app_log: Log de la acción a registrar

        Returns:
            Log de la acción registrada
        """
        pass
