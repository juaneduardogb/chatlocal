from fastapi import UploadFile
from domain.utilities.interfaces.utilities_repository import UtilitiesRepositoryInterface
from domain.utilities.entities.documents import ExtractTextFromDocumentResponse


class ExtractTextFromDocumentUseCase:
    """
    Caso de uso para extraer texto de un documento PDF.
    """

    def __init__(self, repository: UtilitiesRepositoryInterface):
        self.repository = repository

    async def execute(self, file: UploadFile) -> ExtractTextFromDocumentResponse:
        """
        Ejecuta el caso de uso para extraer texto de un documento PDF.

        Args:
            file: Archivo PDF del cual extraer el texto

        Returns:
            Respuesta con el texto extraído y metadatos del documento
        """
        return await self.repository.extract_text_from_document(file)
