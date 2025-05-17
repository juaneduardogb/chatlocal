import motor.motor_asyncio
from beanie import init_beanie
from constants import settings
from domain.chat.entities.chat import ChatHistory, ChatSession
from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase
from domain.embeddings.entities.embeddings import DocumentEmbedding
from domain.app_config.entities.app_log import AppLog


async def init_db():
    """
    The `init_db` function initializes a connection to a MongoDB database using Motor and Beanie in
    Python asyncio.
    """
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_CONNECTION_STRING,
        # ssl=True,
        # tlsAllowInvalidCertificates=True,
        # serverSelectionTimeoutMS=100000,
    )

    await init_beanie(
        database=client.chat,
        document_models=[
            DocumentKnowledge,
            KnowledgeBase,
            ChatHistory,
            DocumentEmbedding,
            ChatSession,
            AppLog,
        ],
    )
