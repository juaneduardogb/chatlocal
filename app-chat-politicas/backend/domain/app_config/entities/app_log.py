from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel, Field


class AppLog(Document):
    """
    Modelo para registrar acciones realizadas en la aplicación.
    Se utiliza para registrar acciones como la aceptación de términos y condiciones.
    """

    user_email: str
    action: str  # Tipo de acción (ej. "accept_terms", "login", etc.)
    endpoint: str  # Endpoint relacionado con la acción
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Optional[dict] = None  # Detalles adicionales específicos de la acción

    class Settings:
        name = "AppLogs"


class TermsAcceptanceRequest(BaseModel):
    """
    Modelo para solicitar la confirmación de términos y condiciones.
    """

    accepted: bool


class TermsAcceptanceResponse(BaseModel):
    """
    Modelo para responder a la confirmación de términos y condiciones.
    """

    accepted: bool
    timestamp: datetime


class AppConfigResponse(BaseModel):
    """
    Modelo para responder con la configuración de la aplicación,
    incluyendo información de solicitudes HTTP y aceptación de términos.
    """

    requests_last_24_hours: int
    max_requests_per_ip: int
    terms_accepted: bool
    terms_acceptance_date: Optional[datetime] = None
    token: str
