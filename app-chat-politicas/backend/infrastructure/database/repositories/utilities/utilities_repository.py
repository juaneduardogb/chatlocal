import fitz
from fastapi import UploadFile, HTTPException

from domain.utilities.interfaces.utilities_repository import UtilitiesRepositoryInterface
from domain.utilities.entities.documents import ExtractTextFromDocumentResponse
from infrastructure.services.storage.azure import upload_to_azure
from utils import convert_size

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB in bytes


class UtilitiesRepository(UtilitiesRepositoryInterface):
    """
    Implementación del repositorio de utilidades.
    """

    async def extract_text_from_document(self, file: UploadFile) -> ExtractTextFromDocumentResponse:
        """
        Extrae texto de un documento PDF.

        Args:
            file: Archivo PDF del cual extraer el texto

        Returns:
            Respuesta con el texto extraído y metadatos del documento

        Raises:
            HTTPException: Si el archivo no es un PDF o excede el tamaño máximo permitido
        """
        # Verificar el tipo de archivo
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        # Leer el contenido del archivo
        content = await file.read()

        # Verificar el tamaño del archivo
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 50 MB.")

        # Subir el archivo a Azure Blob Storage
        result_blob_storage = await upload_to_azure(content, file.filename)

        # Abrir el PDF y extraer el texto
        pdf_document = fitz.open(stream=content, filetype="pdf")

        # Variable para almacenar todo el texto extraído
        full_text = ""

        # Iterar sobre cada página del PDF
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text = page.get_text()
            full_text += text

        # Formatear el tamaño del archivo
        size_readable = await convert_size(file.size)

        # Construir y retornar la respuesta
        return ExtractTextFromDocumentResponse(
            documentContent=full_text,
            documentUrl=result_blob_storage["pdf_url"],
            documentUniqueName=result_blob_storage["unique_name"],
            sizeFormatted=size_readable,
            size=file.size,
            documentName=file.filename,
        )
