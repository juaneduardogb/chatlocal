from datetime import datetime
from typing import List, Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

from domain.documents.entities.documents import LineOfService, ProfilesAllowed


class DocumentEmbeddingInput(BaseModel):
    content: str = Field(min_length=2)


class DocumentEmbedding(Document):
    documentName: str = Field(min_length=2)
    documentUniqueProcessID: str = Field(min_length=2)
    embedding: list[float] = Field(min_length=1)
    contentChunk: str = Field(min_length=2)
    knowledgeBaseId: PydanticObjectId
    los: List[LineOfService] = Field(min_length=1)
    profiles: List[ProfilesAllowed] = Field(min_length=1)

    createdAt: datetime = Field(default_factory=datetime.now)
    lastUpdate: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        collection = "DocumentEmbedding"
        validate_on_save = True
        cache = True

    async def save(self, *args, **kwargs):
        self.lastUpdate = datetime.now()
        return await super().save(*args, **kwargs)
