from domain.app_config.interfaces.app_config_repository import AppConfigRepositoryInterface
from domain.app_config.entities.app_log import TermsAcceptanceRequest, TermsAcceptanceResponse


class AcceptTermsUseCase:
    """Caso de uso para aceptar términos y condiciones"""

    def __init__(self, repository: AppConfigRepositoryInterface):
        self.repository = repository

    async def execute(self, terms_request: TermsAcceptanceRequest, user_email: str) -> TermsAcceptanceResponse:
        """
        Ejecuta el caso de uso para aceptar términos y condiciones

        Args:
            terms_request: Solicitud de aceptación de términos
            user_email: Email del usuario obtenido del token

        Returns:
            Respuesta de la aceptación de términos
        """
        # Crear un nuevo objeto con el email del usuario
        complete_request = TermsAcceptanceRequest(accepted=terms_request.accepted)

        # Pasar el email del usuario como parámetro adicional
        return await self.repository.accept_terms(complete_request, user_email)
