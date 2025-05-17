from typing import Optional
from domain.chat.interfaces.chat_repository import ChatRepositoryInterface
from domain.chat.entities.chat import ChatSession


class GetChatSessionUseCase:
    """Caso de uso para obtener una sesión de chat"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, chat_id: str) -> Optional[ChatSession]:
        """
        Ejecuta el caso de uso para obtener una sesión de chat.

        Args:
            chat_id: ID de la sesión de chat

        Returns:
            La sesión de chat o None si no existe
        """
        return await self.repository.get_chat_session(chat_id)
