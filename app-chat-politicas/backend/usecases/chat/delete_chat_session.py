from domain.chat.interfaces.chat_repository import ChatRepositoryInterface


class DeleteChatSessionUseCase:
    """Caso de uso para eliminar una sesión de chat"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, chat_id: str, user_email: str) -> bool:
        """
        Ejecuta el caso de uso para eliminar una sesión de chat.

        Args:
            chat_id: ID de la sesión de chat
            user_email: Email del usuario

        Returns:
            True si la sesión fue eliminada, False en caso contrario
        """
        return await self.repository.delete_chat_session(chat_id, user_email)
