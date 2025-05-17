from typing import Dict, List, Any
from domain.chat.interfaces.chat_repository import ChatRepositoryInterface


class GetUserChatSessionsUseCase:
    """Caso de uso para obtener las sesiones de chat de un usuario"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, user_email: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Ejecuta el caso de uso para obtener las sesiones de chat de un usuario.

        Args:
            user_email: Email del usuario

        Returns:
            Diccionario con las sesiones de chat categorizadas
        """
        return await self.repository.get_user_chat_sessions(user_email)
