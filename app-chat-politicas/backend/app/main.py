from fastapi import FastAPI, Request, HTTPException
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Usar la nueva inicialización de la base de datos
from infrastructure.database.init_db import init_db

from middlewares.rate_limit import check_request_limit, limiter, rate_limit_handler
from app.api.v1.chat.router import chat_router
from app.api.v1.documents.router import documents_router
from app.api.v1.knowledge_base.router import knowledge_base_router
from app.api.v1.app_config.router import app_config_router
from app.api.v1.utilities.router import utilities_router
from constants import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Se inicializa la conexión a Mongo cuando se levanta el API
    await init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Chat PwC Chile",
    summary="Backend para el sistema de Chat PwC",
    version="0.1",
    root_path="/api/chat-ia",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar rate limiting
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.middleware("http")(check_request_limit)
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Incluir routers
app.include_router(chat_router, prefix="/chat")
app.include_router(documents_router, prefix="/documents")
app.include_router(knowledge_base_router, prefix="/knowledge-base")
app.include_router(app_config_router, prefix="/app-config")
app.include_router(utilities_router, prefix="/utilities")


@app.get("/")
async def read_root():
    return {"message": "Bienvenido a la API de Chat"}
