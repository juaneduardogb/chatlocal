from abc import ABC, abstractmethod
from fastapi import UploadFile
from domain.utilities.entities.documents import ExtractTextFromDocumentResponse


class UtilitiesRepositoryInterface(ABC):
    """
    Interfaz para el repositorio de utilidades.
    """

    @abstractmethod
    async def extract_text_from_document(self, file: UploadFile) -> ExtractTextFromDocumentResponse:
        """
        Extrae texto de un documento PDF.

        Args:
            file: Archivo PDF del cual extraer el texto

        Returns:
            Respuesta con el texto extraído y metadatos del documento
        """
        pass
