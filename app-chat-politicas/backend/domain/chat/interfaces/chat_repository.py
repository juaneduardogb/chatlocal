from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from domain.chat.entities.chat import ChatHistory, ChatSession, UserChatsView


class ChatRepositoryInterface(ABC):
    """Interfaz para el repositorio de chat"""

    @abstractmethod
    async def retrieve_chat_history(self, session_id: str) -> ChatHistory | None:
        """
        Recupera el historial de chat para una sesión específica.

        Args:
            session_id: ID de la sesión de chat

        Returns:
            El historial de chat o None si no existe
        """
        pass

    @abstractmethod
    async def get_relevant_documents(self, query: str) -> list:
        """
        Obtiene los documentos más relevantes basados en la consulta del usuario.

        Args:
            query: La consulta del usuario en texto plano

        Returns:
            Una lista de documentos relevantes con su contenido
        """
        pass

    @abstractmethod
    async def save_chat_session(self, chat_session: ChatSession) -> ChatSession:
        """
        Guarda una sesión de chat en la base de datos.
        Si la sesión ya existe, se actualizará.

        Args:
            chat_session: La sesión de chat a guardar

        Returns:
            La sesión de chat guardada
        """
        pass

    @abstractmethod
    async def get_chat_session(self, chat_id: str) -> Optional[ChatSession]:
        """
        Recupera una sesión de chat por su ID.

        Args:
            chat_id: ID de la sesión de chat

        Returns:
            La sesión de chat o None si no existe
        """
        pass

    @abstractmethod
    async def get_user_chat_sessions(self, user_email: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Recupera todas las sesiones de chat de un usuario, categorizadas por período de tiempo.

        Args:
            user_email: Email del usuario

        Returns:
            Diccionario con las sesiones de chat categorizadas
        """
        pass

    @abstractmethod
    async def delete_chat_session(self, chat_id: str, user_email: str) -> bool:
        """
        Elimina una sesión de chat por su ID y el email del usuario.

        Args:
            chat_id: ID de la sesión de chat
            user_email: Email del usuario

        Returns:
            True si la sesión fue eliminada, False en caso contrario
        """
        pass
