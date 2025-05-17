import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Chat IA PwC Chile"
    MAX_REQUEST_PER_IP: int = 60
    MAX_RETRIES: int = 2

    REQUEST_TIMEOUT: int = 120

    # Sync ACL
    SYNC_ACL_URL: str = os.getenv("SYNC_ACL_URL")
    SYNC_ACL_SECRET: str = os.getenv("SYNC_ACL_SECRET")
    SYNC_ACL_APPLICATION_NAME: str = os.getenv("SYNC_ACL_APPLICATION_NAME")

    # DB Secret
    MONGODB_CONNECTION_STRING: str = os.getenv("MONGODB_CONNECTION_STRING")
    DATAWARE_HOUSE_CONNECTION_STRING: str = os.getenv("DATAWARE_HOUSE_CONNECTION_STRING")

    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB: str = os.getenv("REDIS_DB", "default")
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_TOKEN_EXPIRY: int = int(os.getenv("REDIS_TOKEN_EXPIRY", 86400))  # 24 horas por defecto

    # Azure secrets
    AZ_BLOB_CONTAINER_NAME: str = os.getenv("AZ_BLOB_CONTAINER_NAME")
    AZURE_BLOB_CONNECTION_STRING: str = os.getenv("AZURE_BLOB_CONNECTION_STRING")
    AZ_BLOB_ACCOUNT_NAME: str = os.getenv("AZ_BLOB_ACCOUNT_NAME")
    AZ_BLOB_ACCOUNT_KEY: str = os.getenv("AZ_BLOB_ACCOUNT_KEY")
    AZ_BLOB_ACCOUNT_URL: str = os.getenv("AZ_BLOB_ACCOUNT_URL")

    # API Keys
    BING_API_KEY: str | None = None

    # Open AI Keys
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    EMBEDDING_API_URL: str = os.getenv("EMBEDDING_API_URL")

    # Agent Configuration
    DEFAULT_AGENT_TEMPERATURE: float = 0.2
    DEFAULT_AGENT_TOP_N: float = 0.9
    DEFAULT_AGENT_N: float = 1

    AZURE_TEXT_EMBEDDING_MODEL_NAME: str = os.getenv("AZURE_TEXT_EMBEDDING_MODEL_NAME")
    MODEL_CHAT_COMPLETION: str = os.getenv("MODEL_CHAT_COMPLETION")

    DEFAULT_MODEL_ARGS: dict = {"temperature": 0.2, "top_p": 0.9, "n": 1}
