from datetime import datetime
from typing import List, Optional
from fastapi import Body
from pydantic import BaseModel, Field

from domain.documents.entities.documents import (
    BasicPerson,
    ContractType,
    DocumentStatus,
    KnowledgeBase,
    LineOfService,
    ProfilesAllowed,
    TagsElements,
    TypeOfWorkday,
    generate_unique_process_id,
)


class DocumentCreationForm(BaseModel):
    documentName: str = Body(..., min_length=2)
    los: List[LineOfService] = Body(..., min_length=1)
    losOwner: str = Body(..., min_length=1)
    subLoS: str = Body(..., min_length=1)
    labels: List[TagsElements] = Body(...)
    support: List[BasicPerson] = Body(..., min_length=1)
    statuses: DocumentStatus = Body(...)
    profiles: List[ProfilesAllowed] = Body(..., min_length=1)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)
    knowledgeBase: KnowledgeBase = Body(...)
    sizeFormatted: str = Body(..., min_length=2)
    size: int = Body(..., ge=1)
    documentUrl: str = Body(..., min_length=2)
    documentUniqueName: str = Body(..., min_length=2)
    content: str = Body(..., min_length=2)
    tagsByAuthor: List[TagsElements] = Body(...)


class KnowledgeBaseForm(BaseModel):
    knowledgeId: Optional[str] = Field(default_factory=lambda: generate_unique_process_id("KN"), unique=True)
    name: str = Field(min_length=2)
    description: str = Field(min_length=2)
    author: str = Field(min_length=2)
    totalDocuments: int = Field(ge=1)
    los: List[LineOfService] = Field(min_length=1)
    profiles: List[ProfilesAllowed] = Field(min_length=1)
    losOwner: str = Field(min_length=1)
    subLoS: str = Field(min_length=1)
    support: List[BasicPerson] = Field(min_length=1)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)
    createdAt: Optional[datetime] = Field(default_factory=datetime.now)
    lastUpdate: Optional[datetime] = Field(default_factory=datetime.now)


class DocumentUpdate(BaseModel):
    uniqueProcessID: str = Field(min_length=6, examples=["DOC-IA-XXXXXXX"])
    documentName: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    los: List[LineOfService] = Field(min_length=1)
    profile: List[ProfilesAllowed] = Field(min_length=1)
    losOwner: str = Field(min_length=1)
    subLoS: str = Field(min_length=1)
    supportPersons: List[BasicPerson] = Field(min_length=1)
    labels: Optional[List[TagsElements]] = Field(default=0)
    tagsByAuthor: Optional[List[TagsElements]] = Field(default=0)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)
    modifiedBy: str = Field(min_length=1)
    publish: Optional[bool] = Field(default=False)


class KnowledgeMassiveConfiguration(BaseModel):
    knowledgeId: str = Field(min_length=1, examples=["KN-IA-XXXXXXXXX"])
    los: List[LineOfService] = Field(min_length=1)
    profiles: List[ProfilesAllowed] = Field(min_length=1)
    losOwner: str = Field(min_length=1)
    subLoS: str = Field(min_length=1)
    support: List[BasicPerson] = Field(min_length=1)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)
    modifiedBy: str = Field(min_length=1)
    allDocumentsIds: List[str] = Field(min_length=1, examples=["DOC-IA-XXXXXXX"])
