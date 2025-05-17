from domain.chat.interfaces.chat_repository import ChatRepositoryInterface
from domain.chat.entities.chat import ChatSession


class SaveChatSessionUseCase:
    """Caso de uso para guardar una sesión de chat"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, chat_session: ChatSession) -> ChatSession:
        """
        Ejecuta el caso de uso para guardar una sesión de chat.

        Args:
            chat_session: La sesión de chat a guardar

        Returns:
            La sesión de chat guardada
        """
        return await self.repository.save_chat_session(chat_session)
