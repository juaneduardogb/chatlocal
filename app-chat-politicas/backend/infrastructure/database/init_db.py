import motor.motor_asyncio
from beanie import init_beanie

from constants import settings

# Nueva arquitectura (Clean Architecture)
from domain.chat.entities.chat import ChatHistory, ChatSession
from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase
from domain.embeddings.entities.embeddings import DocumentEmbedding
from domain.app_config.entities.app_log import AppLog


async def init_db():
    """
    Inicializa la conexión a la base de datos MongoDB y registra los modelos de documento.
    """
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_CONNECTION_STRING,
        ssl=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=100000,
    )

    # Inicializar todos los modelos de documento
    await init_beanie(
        database=client.chat,
        document_models=[
            # Modelos de la nueva arquitectura (Clean Architecture)
            DocumentKnowledge,
            KnowledgeBase,
            ChatHistory,
            DocumentEmbedding,
            ChatSession,
            AppLog,
        ],
    )

    print("Base de datos inicializada correctamente. Modelos registrados.")
