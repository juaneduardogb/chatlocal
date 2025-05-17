from fastapi import APIRouter

from app.api.v1.app_config.router import app_config_router
from app.api.v1.knowledge_base.router import knowledge_base_router
from app.api.v1.documents.router import documents_router
from app.api.v1.chat.router import chat_router
from app.api.v1.utilities.router import utilities_router

api_router = APIRouter()

api_router.include_router(app_config_router, prefix="/app-config")
api_router.include_router(knowledge_base_router, prefix="/knowledge-base")
api_router.include_router(documents_router, prefix="/documents")
api_router.include_router(chat_router, prefix="/chat")
api_router.include_router(utilities_router, prefix="/utilities")
