from core.config import Settings
from openai import AsyncOpenAI

settings = Settings()
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_API_BASE)
