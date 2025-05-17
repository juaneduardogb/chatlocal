from fastapi import HTTPException

from domain.chat.interfaces.chat_repository import ChatRepositoryInterface
from domain.chat.entities.chat import MessageRating


class RateMessageUseCase:
    """Caso de uso para calificar un mensaje de chat"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, rating_request: MessageRating) -> dict:
        """
        Ejecuta el caso de uso para calificar un mensaje

        Args:
            rating_request: Solicitud de calificación con los detalles del mensaje

        Returns:
            Diccionario con el estado de la operación

        Raises:
            HTTPException: Si el chat o el mensaje no existen, o si el usuario no tiene acceso
        """
        chat_id = rating_request.chatId
        message_id = rating_request.messageId
        rating = rating_request.rating
        user_email = rating_request.userEmail

        # Obtener la sesión de chat
        chat_session = await self.repository.get_chat_session(chat_id)
        if not chat_session:
            raise HTTPException(status_code=404, detail=f"Chat session with ID {chat_id} not found")

        # Validar que el usuario tenga acceso al chat
        if chat_session.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para calificar mensajes en este chat")

        # Actualizar la calificación del mensaje
        updated = False
        for message in chat_session.messages:
            if message.id == message_id:
                message.rating = rating
                updated = True
                break

        if not updated:
            raise HTTPException(status_code=404, detail=f"Message with ID {message_id} not found in chat {chat_id}")

        # Guardar la sesión de chat actualizada
        await self.repository.save_chat_session(chat_session)

        return {"status": "success", "message": "Message rating saved successfully"}
