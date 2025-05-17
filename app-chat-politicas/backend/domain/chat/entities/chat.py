from datetime import datetime
from typing import Dict, List, Optional, Any
from beanie import Document
from pydantic import BaseModel, Field


class ChatHistory(Document):
    """Modelo para el historial de chat"""

    sessionId: str
    chatHistory: List[Dict[str, Any]] = []

    class Settings:
        name = "chat_history"


class ResponseChat(BaseModel):
    """Modelo para la respuesta del chat"""

    content: str
    allDocumentsRelated: Optional[List[Dict[str, Any]]] = None


class ChatMessage(BaseModel):
    """Modelo para un mensaje de chat"""

    id: str
    role: str
    content: str
    experimentalAttachments: Optional[List[Dict[str, Any]]] = []
    toolInvocations: Optional[List[Dict[str, Any]]] = []
    createdAt: Optional[datetime] = None
    rating: Optional[str] = None


class ChatSession(Document):
    """Modelo para una sesión de chat"""

    chatId: str
    userEmail: str
    title: Optional[str] = None
    messages: List[ChatMessage] = []
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "ChatSession"

    async def save(self, *args, **kwargs):
        self.updatedAt = datetime.now()
        return await super().save(*args, **kwargs)


class UserChatsView(BaseModel):
    """
    Vista de chats de usuario categorizados por tiempo
    """

    title: str
    chatId: str
    createdAt: datetime
    updatedAt: datetime


class ClientAttachment(BaseModel):
    """Modelo para adjuntos de cliente"""

    name: str
    contentType: str
    url: str


class ToolInvocation(BaseModel):
    """Modelo para invocación de herramientas"""

    toolCallId: str
    toolName: str
    args: dict
    result: dict


class MessageRating(BaseModel):
    """Modelo para la calificación de mensajes"""

    chatId: str
    messageId: str
    rating: Optional[str] = None  # "positive", "negative" o None
    userEmail: str


class EventMessage(BaseModel):
    """Modelo para mensajes de eventos"""

    id: str
    timestamp: datetime
    type: str
    message: str


class AppChatMessages(BaseModel):
    """Modelo para los mensajes de chat de la aplicación"""

    chatId: str
    messages: List[ChatMessage]


class SaveChatRequest(BaseModel):
    """Modelo para la solicitud de guardar un chat"""

    chatId: str
    userEmail: str
    messages: List[ChatMessage]
    title: Optional[str] = None


class RenameChatRequest(BaseModel):
    """Modelo para la solicitud de renombrar un chat"""

    chatId: str
    userEmail: str
    title: str
