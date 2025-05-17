from pydantic import BaseModel
from typing import Optional


class ExtractTextFromDocumentResponse(BaseModel):
    """
    Respuesta para la extracción de texto de un documento.
    """

    documentContent: str
    documentUrl: str
    documentUniqueName: str
    sizeFormatted: str
    size: int
    documentName: str
