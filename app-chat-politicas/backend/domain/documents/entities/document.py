from typing import Dict, List, Optional
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from shared.utils.id_generator import generate_unique_process_id


class TagsElements(BaseModel):
    """Modelo para elementos de etiquetas"""

    label: str
    id: str


class TypeOfWorkday(Enum):
    """Enumeración para tipos de jornada laboral"""

    TIEMPO_COMPLETO = "Tiempo completo"
    TIEMPO_PARCIAL = "Tiempo parcial"


class ContractType(Enum):
    """Enumeración para tipos de contrato"""

    INDEFINIDO = "Indefinido"
    PLAZO_FIJO = "Plazo fijo"


class ProfilesAllowed(str, Enum):
    """Enumeración para perfiles permitidos"""

    Socio = "Socio"
    Director = "Director"
    Gerente = "Gerente"
    SeniorManager = "Senior Manager"
    Supervisor = "Supervisor"
    Coordinador = "Coordinador"
    Especialista = "Especialista"
    Analista = "Analista"
    Asistente = "Asistente"
    Practicante = "Practicante"


class LineOfService(str, Enum):
    """Enumeración para líneas de servicio"""

    xLoS = "xLoS"
    Assurance = "Assurance"
    Tax = "Tax"
    Advisory = "Advisory"
    IFS = "IFS"


class DocumentStatusItem(BaseModel):
    """Modelo para un ítem de estado de documento"""

    confirmation: bool = False
    date: Optional[datetime | None]
    person: Optional[str | None]


class DocumentStatus(BaseModel):
    """Modelo para el estado de un documento"""

    labels: DocumentStatusItem
    access: DocumentStatusItem
    owners: DocumentStatusItem
    support: DocumentStatusItem
    publish: DocumentStatusItem


class BasicPerson(BaseModel):
    """Modelo para una persona básica"""

    name: str
    email: str
    employeeId: int
