from typing import Dict, List, Optional
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime

from domain.documents.entities.document import (
    LineOfService,
    ProfilesAllowed,
    TypeOfWorkday,
    ContractType,
    BasicPerson,
    TagsElements,
    DocumentStatus,
)
from domain.documents.entities.knowledge_base import KnowledgeBase
from shared.utils.id_generator import generate_unique_process_id


class DocumentKnowledge(Document):
    """Modelo para un documento de conocimiento"""

    documentName: str = Field(
        min_length=2,
    )
    uniqueProcessID: str = Field(default_factory=lambda: generate_unique_process_id(), unique=True)
    los: List[LineOfService] = Field(min_length=1)
    losOwner: str = Field(min_length=1)
    subLoS: str = Field(min_length=1)
    labels: List[TagsElements] = Field(min_length=0)
    tagsByAuthor: List[TagsElements] = Field(min_length=0)
    support: List[BasicPerson] = Field(min_length=1)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)
    statuses: DocumentStatus
    isPublished: bool = Field(default=False)
    profiles: List[ProfilesAllowed] = Field(min_length=1)
    knowledgeBase: KnowledgeBase
    sizeFormatted: str = Field(min_length=2)
    size: int = Field(ge=1)
    metaData: Optional[List[Dict[str, str | list]]] = Field(default=None)
    summary: Optional[str] = Field(default=None)
    documentUrl: Optional[str] = Field(min_length=2)
    documentUniqueName: Optional[str] = Field(min_length=2)
    content: str = Field(min_length=1)

    createdAt: datetime = Field(default_factory=datetime.now)
    lastUpdate: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        collection = "documents"
        validate_on_save = True
        use_state_management = True

    def __init__(self, **data):
        super().__init__(**data)
        if not self.labels:
            self.labels.append(TagsElements(label="links", id=generate_unique_process_id("TAG")))
            self.labels.append(TagsElements(label="personas", id=generate_unique_process_id("TAG")))
            self.labels.append(TagsElements(label="fechas", id=generate_unique_process_id("TAG")))

    async def save(self, *args, **kwargs):
        self.lastUpdate = datetime.now()
        return await super().save(*args, **kwargs)
