from typing import Optional
from datetime import datetime
from fastapi import HTTPException

from domain.chat.interfaces.chat_repository import ChatRepositoryInterface


class DownloadChatUseCase:
    """Caso de uso para descargar un chat en formato texto"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, chat_id: str, user_email: Optional[str] = None) -> tuple:
        """
        Ejecuta el caso de uso para descargar un chat

        Args:
            chat_id: ID del chat a descargar
            user_email: Email del usuario (opcional, para validación de acceso)

        Returns:
            Tupla (contenido del archivo, nombre del archivo)

        Raises:
            HTTPException: Si el chat no existe o el usuario no tiene acceso
        """
        # Obtener la sesión de chat
        chat_session = await self.repository.get_chat_session(chat_id)

        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat no encontrado")

        # Validar que el usuario tenga acceso al chat (si se proporcionó un email)
        if user_email and chat_session.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para descargar este chat")

        # Preparar el contenido del archivo
        content = []

        for message in chat_session.messages:
            if message.role == "user":
                content.append(f"Usuario: {message.content} \nFecha: {message.createdAt} \n")
            elif message.role == "assistant":
                content.append(f"Sistema: {message.content} \nFecha: {message.createdAt} \n")

            content.append("===========")

        # Unir todo el contenido con saltos de línea
        text_content = "\n".join(content)

        # Generar un nombre para el archivo con la fecha actual
        file_name = f"chat_{chat_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

        return text_content, file_name
