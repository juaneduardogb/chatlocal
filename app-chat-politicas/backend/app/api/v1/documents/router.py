import base64
import json
from datetime import datetime
from typing import Tuple

from constants import settings, openai_client
from fastapi import APIRouter, HTTPException, Path, Depends
from litellm import acompletion
from domain.documents.entities.body import DocumentCreationForm, DocumentUpdate
from domain.documents.entities.documents import (
    DocumentKnowledge,
    DocumentStatus,
    DocumentStatusItem,
    KnowledgeBase,
)
from domain.documents.entities.responses import DeleteDocumentResponse, DocumentsByUserResponse
from openai import AsyncOpenAI
from middlewares.auth import get_current_user_and_token
from app.api.dependencies import (
    get_current_user_and_token,
    get_documents_by_user_usecase,
    get_upload_document_usecase,
    get_delete_document_usecase,
    get_update_document_usecase,
)
from usecases.documents.get_documents_by_user import GetDocumentsByUserUseCase
from usecases.documents.upload_document import UploadDocumentUseCase
from usecases.documents.delete_document import DeleteDocumentUseCase
from usecases.documents.update_document import UpdateDocumentUseCase

documents_router = APIRouter(tags=["Documents"])


@documents_router.get("/get-all-documents-by-user", response_model=DocumentsByUserResponse)
async def get_all_documents_by_user(
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    documents_usecase: GetDocumentsByUserUseCase = Depends(get_documents_by_user_usecase),
):
    employee_decode = user_and_token[0]  # Correo del usuario autenticado
    return await documents_usecase.execute(employee_decode)


@documents_router.post("/upload-document", response_model=DocumentKnowledge)
async def upload_document(
    document: DocumentCreationForm,
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    upload_document_usecase: UploadDocumentUseCase = Depends(get_upload_document_usecase),
):
    current_user_email = user_and_token[0]
    return await upload_document_usecase.execute(document, current_user_email)


@documents_router.delete("/{document_id}", response_model=DeleteDocumentResponse)
async def delete_document(
    document_id: str = Path(
        ...,
        description="ID único del documento.",
        min_length=2,
        example="DOC-IA-XXXXXXXX",
    ),
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    delete_document_usecase: DeleteDocumentUseCase = Depends(get_delete_document_usecase),
):
    current_user_email = user_and_token[0]
    return await delete_document_usecase.execute(document_id, current_user_email)


@documents_router.put("/", response_model=DocumentKnowledge)
async def update_document(
    document: DocumentUpdate,
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
    update_document_usecase: UpdateDocumentUseCase = Depends(get_update_document_usecase),
):
    user_email = user_and_token[0]
    return await update_document_usecase.execute(document, user_email)
