from pydantic import BaseModel
from typing import List

from domain.documents.entities.documents import (
    DocumentKnowledge,
    KnowledgeBase,
)


class GenericDetail(BaseModel):
    success: bool
    message: str


class GenericResponse(BaseModel):
    detail: str | GenericDetail


class DocumentResponse(BaseModel):
    knowledgeBase: KnowledgeBase
    documents: List[DocumentKnowledge]
    totalDocuments: int
    totalPublished: int
    totalPending: int


class DeleteDocumentResponse(GenericResponse): ...


class DocumentUpdateResponse(GenericResponse): ...


class MassiveConfResponse(GenericResponse): ...


class KnowledgeNotFound(GenericResponse):
    detail: str = "La base de conocimientos no existe."


class KnowledgeNotAccess(GenericResponse):
    detail: str = "No tienes acceso para consultar esta base de conocimentos"


class DocumentsByUserResponse(BaseModel):
    documents: List[DocumentKnowledge]
    totalDocuments: int
    totalPublished: int
    totalPending: int
