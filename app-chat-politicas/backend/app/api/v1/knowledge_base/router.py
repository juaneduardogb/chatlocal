import base64
import json
from typing import List, Tuple
from fastapi import APIRouter, HTTPException, Path, Depends
from fastapi.responses import JSONResponse

from domain.documents.entities.responses import (
    DocumentResponse,
    KnowledgeNotAccess,
    KnowledgeNotFound,
    MassiveConfResponse,
)
from domain.documents.entities.body import (
    DocumentUpdate,
    KnowledgeBaseForm,
    KnowledgeMassiveConfiguration,
)
from domain.documents.entities.documents import (
    DocumentKnowledge,
    KnowledgeBase,
)
from domain.embeddings.entities.embeddings import DocumentEmbedding
from middlewares.auth import get_current_user_and_token
from app.api.dependencies import (
    get_documents_from_knowledge_base_usecase,
    get_knowledge_base_usecase,
    get_all_knowledge_base_usecase,
    get_create_knowledge_base_usecase,
    get_delete_knowledge_base_usecase,
    get_massive_knowledge_configuration_usecase,
)
from usecases.knowledge_base.get_documents_from_knowledge_base import GetDocumentsFromKnowledgeBaseUseCase
from usecases.knowledge_base.get_all_knowledge_base import GetAllKnowledgeBaseUseCase
from usecases.knowledge_base.create_knowledge_base import CreateKnowledgeBaseUseCase
from usecases.knowledge_base.delete_knowledge_base import DeleteKnowledgeBaseUseCase
from usecases.knowledge_base.massive_knowledge_configuration import MassiveKnowledgeConfigurationUseCase

knowledge_base_router = APIRouter(tags=["Knowledge Base"])


@knowledge_base_router.get(
    "/get-documents-from-knowledge-base/{knowledge_id}",
    response_model=DocumentResponse,
    responses={
        403: {
            "description": "No tienes acceso para consultar esta base de conocimentos",
            "content": {"application/json": {}},
            "model": KnowledgeNotAccess,
        },
        404: {
            "description": "La base de conocimientos no existe.",
            "content": {},
            "model": KnowledgeNotFound,
        },
    },
)
async def get_documents_from_knowledge_base(
    knowledge_id: str = Path(
        ...,
        description="Id de la base de conocimiento",
        min_length=2,
        max_length=255,
    ),
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    documents_knowledge_base_usecase: GetDocumentsFromKnowledgeBaseUseCase = Depends(get_documents_from_knowledge_base_usecase),
    knowledge_base_usecase: GetDocumentsFromKnowledgeBaseUseCase = Depends(get_knowledge_base_usecase),
):
    user_email = user_and_token[0]

    kb = await knowledge_base_usecase.execute(knowledge_id, user_email)

    documents = await documents_knowledge_base_usecase.execute(knowledge_id, user_email)

    total_published = len([doc for doc in documents if doc.isPublished])
    total_pending = len([doc for doc in documents if doc.isPublished is False])

    return DocumentResponse(
        knowledgeBase=kb, documents=documents, totalPublished=total_published, totalPending=total_pending, totalDocuments=len(documents)
    )


@knowledge_base_router.get("/", response_model=List[KnowledgeBase])
async def get_all_knowledge_base(
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    knowledge_base_usecase: GetAllKnowledgeBaseUseCase = Depends(get_all_knowledge_base_usecase),
):
    # Obtenemos el email del usuario autenticado
    email = user_and_token[0]
    return await knowledge_base_usecase.execute(email)


@knowledge_base_router.post("/create-knowledge-base", response_model=KnowledgeBase)
async def create_knowledge_base(
    knowledge_base: KnowledgeBaseForm,
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    knowledge_base_usecase: CreateKnowledgeBaseUseCase = Depends(get_create_knowledge_base_usecase),
):
    return await knowledge_base_usecase.execute(knowledge_base, user_and_token[0])


@knowledge_base_router.post("/massive-knowledge-configuration", response_model=MassiveConfResponse)
async def massive_knowledge_configuration(
    knowledge_conf: KnowledgeMassiveConfiguration,
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    knowledge_base_usecase: MassiveKnowledgeConfigurationUseCase = Depends(get_massive_knowledge_configuration_usecase),
):
    user_email = user_and_token[0]
    return await knowledge_base_usecase.execute(knowledge_conf, user_email)


@knowledge_base_router.delete("/{knowledge_id}", response_model=KnowledgeBase)
async def delete_knowledge_base(
    knowledge_id: str = Path(
        ...,
        description="Id de la base de conocimiento",
        min_length=2,
        max_length=255,
        example="KN-IA-XXXXXXXXX",
    ),
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    knowledge_base_usecase: DeleteKnowledgeBaseUseCase = Depends(get_delete_knowledge_base_usecase),
):
    email = user_and_token[0]
    return await knowledge_base_usecase.execute(knowledge_id, email)
