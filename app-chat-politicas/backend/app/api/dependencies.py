from typing import Tuple, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from typing import Annotated


from infrastructure.services.redis import RedisService
from constants import settings
from infrastructure.database.repositories.documents.documents_repository import DocumentsRepository
from infrastructure.database.repositories.knowledge_base.knowledge_base_repository import KnowledgeBaseRepository
from infrastructure.database.repositories.chat.chat_repository import ChatRepository

# Casos de uso de documentos
from usecases.documents.get_documents_by_user import GetDocumentsByUserUseCase
from usecases.documents.upload_document import UploadDocumentUseCase
from usecases.documents.delete_document import DeleteDocumentUseCase
from usecases.documents.update_document import UpdateDocumentUseCase

# Casos de uso de knowledge base
from usecases.knowledge_base.get_documents_from_knowledge_base import GetDocumentsFromKnowledgeBaseUseCase
from usecases.knowledge_base.get_all_knowledge_base import GetAllKnowledgeBaseUseCase
from usecases.knowledge_base.create_knowledge_base import CreateKnowledgeBaseUseCase
from usecases.knowledge_base.delete_knowledge_base import DeleteKnowledgeBaseUseCase
from usecases.knowledge_base.massive_knowledge_configuration import MassiveKnowledgeConfigurationUseCase
from usecases.knowledge_base.get_knowledge_base import GetKnowledgeBaseUseCase

# Casos de uso de chat
from usecases.chat.get_relevant_documents import GetRelevantDocumentsUseCase
from usecases.chat.save_chat_session import SaveChatSessionUseCase
from usecases.chat.get_user_chat_sessions import GetUserChatSessionsUseCase
from usecases.chat.delete_chat_session import DeleteChatSessionUseCase
from usecases.chat.get_chat_session import GetChatSessionUseCase
from usecases.chat.get_chat_response import GetChatResponseUseCase
from usecases.chat.download_chat import DownloadChatUseCase
from usecases.chat.rate_message import RateMessageUseCase


# Excepción personalizada para token expirado o inválido
class InvalidTokenException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="TOKEN_INVALID_OR_EXPIRED",
            headers={"WWW-Authenticate": "Bearer"},
        )


security = HTTPBearer()


async def validate_token_with_redis(token: str) -> str:
    """
    Valida un token usando Redis

    Args:
        token: Token de autenticación

    Returns:
        Email del usuario asociado al token

    Raises:
        None: Si no se encuentra el token, devuelve None
    """
    return await RedisService.verify_token(token)


async def get_current_user_and_token(authorization: Optional[str] = Header(None)) -> Tuple[str, str]:
    """
    Obtiene el usuario actual y su token a partir del header Authorization o token directo.
    Solo valida contra Redis, no intenta revalidar con ACL.

    Args:
        token: Token de autenticación del header específico
        authorization: Header Authorization estándar (Bearer token)

    Returns:
        Tupla (email del usuario, token)

    Raises:
        HTTPException: Si no hay token
        InvalidTokenException: Si el token no está en Redis o es inválido
    """
    if authorization:
        authorization = authorization.replace("Bearer ", "")

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó token de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar el token solo con Redis
    email = await validate_token_with_redis(authorization)

    # Si no está en Redis, devolver error 403
    if not email:
        raise InvalidTokenException()

    return email, authorization


# Dependencias de casos de uso para documentos
def get_documents_repository():
    """
    Factory para el repositorio de documentos
    """
    return DocumentsRepository()


def get_documents_by_user_usecase():
    """
    Factory para el caso de uso de obtener documentos por usuario
    """
    repository = get_documents_repository()
    return GetDocumentsByUserUseCase(repository)


def get_upload_document_usecase():
    """
    Factory para el caso de uso de subir un documento
    """
    repository = get_documents_repository()
    return UploadDocumentUseCase(repository)


def get_delete_document_usecase():
    """
    Factory para el caso de uso de eliminar un documento
    """
    repository = get_documents_repository()
    return DeleteDocumentUseCase(repository)


def get_update_document_usecase():
    """
    Factory para el caso de uso de actualizar un documento
    """
    repository = get_documents_repository()
    return UpdateDocumentUseCase(repository)


# Dependencias de casos de uso para knowledge base
def get_knowledge_base_repository():
    """
    Factory para el repositorio de knowledge base
    """
    return KnowledgeBaseRepository()


def get_documents_from_knowledge_base_usecase():
    """
    Factory para el caso de uso de obtener documentos de una base de conocimiento
    """
    repository = get_knowledge_base_repository()
    return GetDocumentsFromKnowledgeBaseUseCase(repository)


def get_all_knowledge_base_usecase():
    """
    Factory para el caso de uso de obtener todas las bases de conocimiento
    """
    repository = get_knowledge_base_repository()
    return GetAllKnowledgeBaseUseCase(repository)


def get_create_knowledge_base_usecase():
    """
    Factory para el caso de uso de crear una base de conocimiento
    """
    repository = get_knowledge_base_repository()
    return CreateKnowledgeBaseUseCase(repository)


def get_delete_knowledge_base_usecase():
    """
    Factory para el caso de uso de eliminar una base de conocimiento
    """
    repository = get_knowledge_base_repository()
    return DeleteKnowledgeBaseUseCase(repository)


def get_massive_knowledge_configuration_usecase():
    """
    Factory para el caso de uso de configuración masiva de conocimiento
    """
    repository = get_knowledge_base_repository()
    update_document_usecase = get_update_document_usecase()
    return MassiveKnowledgeConfigurationUseCase(repository, update_document_usecase)


def get_knowledge_base_usecase():
    """
    Factory para el caso de uso de obtener una base de conocimiento
    """
    repository = get_knowledge_base_repository()
    return GetKnowledgeBaseUseCase(repository)


# Dependencias de casos de uso para chat
def get_chat_repository():
    """
    Factory para el repositorio de chat
    """
    return ChatRepository()


def get_relevant_documents_usecase():
    """
    Factory para el caso de uso de obtener documentos relevantes
    """
    repository = get_chat_repository()
    return GetRelevantDocumentsUseCase(repository)


def get_save_chat_session_usecase():
    """
    Factory para el caso de uso de guardar una sesión de chat
    """
    repository = get_chat_repository()
    return SaveChatSessionUseCase(repository)


def get_user_chat_sessions_usecase():
    """
    Factory para el caso de uso de obtener sesiones de chat de un usuario
    """
    repository = get_chat_repository()
    return GetUserChatSessionsUseCase(repository)


def get_delete_chat_session_usecase():
    """
    Factory para el caso de uso de eliminar una sesión de chat
    """
    repository = get_chat_repository()
    return DeleteChatSessionUseCase(repository)


def get_chat_session_usecase():
    """
    Factory para el caso de uso de obtener una sesión de chat
    """
    repository = get_chat_repository()
    return GetChatSessionUseCase(repository)


def get_chat_response_usecase():
    """
    Factory para el caso de uso de generar una respuesta de chat
    """
    relevant_docs_usecase = get_relevant_documents_usecase()
    return GetChatResponseUseCase(relevant_docs_usecase)


def get_download_chat_usecase():
    """
    Factory para el caso de uso de descargar un chat
    """
    repository = get_chat_repository()
    return DownloadChatUseCase(repository)


def get_rate_message_usecase():
    """
    Factory para el caso de uso de calificar un mensaje
    """
    repository = get_chat_repository()
    return RateMessageUseCase(repository)
