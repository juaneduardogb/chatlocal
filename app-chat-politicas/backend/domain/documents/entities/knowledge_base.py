from typing import Dict, List, Optional
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime

from domain.documents.entities.document import LineOfService, ProfilesAllowed, TypeOfWorkday, ContractType, BasicPerson
from shared.utils.id_generator import generate_unique_process_id


class KnowledgeBase(Document):
    """Modelo para una base de conocimiento"""

    knowledgeId: Optional[str] = Field(default_factory=lambda: generate_unique_process_id("KN"), unique=True)
    name: str = Field(min_length=2)
    description: str = Field(min_length=2)
    author: str = Field(min_length=2)
    totalDocuments: int = Field(ge=0)

    los: List[LineOfService] = Field(min_length=1)
    profiles: List[ProfilesAllowed] = Field(min_length=1)
    losOwner: str = Field(min_length=1)
    subLoS: str = Field(min_length=1)
    support: List[BasicPerson] = Field(min_length=1)
    typeOfWorkday: List[TypeOfWorkday] = Field(min_length=1)
    contractType: List[ContractType] = Field(min_length=1)

    createdAt: Optional[datetime] = Field(default_factory=datetime.now)
    lastUpdate: Optional[datetime] = Field(default_factory=datetime.now)

    class Settings:
        validate_on_save = True
        use_state_management = True
