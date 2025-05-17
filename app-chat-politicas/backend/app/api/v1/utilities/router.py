from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from typing import Tuple

from domain.utilities.entities.documents import ExtractTextFromDocumentResponse
from infrastructure.database.repositories.utilities.utilities_repository import UtilitiesRepository
from usecases.utilities.extract_text_from_document import ExtractTextFromDocumentUseCase
from middlewares.auth import get_current_user_and_token

utilities_router = APIRouter(tags=["Utilities"])

# Crear el repositorio
utilities_repository = UtilitiesRepository()


@utilities_router.post("/extract-text-from-document", response_model=ExtractTextFromDocumentResponse)
async def extract_text_from_document(
    file: UploadFile = File(..., media_type="application/pdf"),
    user_and_token: Tuple[str, str] = Depends(get_current_user_and_token),
):
    """
    Extrae texto de un documento PDF.

    Args:
        file: Archivo PDF del cual extraer el texto
        user_and_token: Tupla (email, token) del usuario autenticado

    Returns:
        Respuesta con el texto extraído y metadatos del documento
    """
    try:
        # Crear el caso de uso
        extract_text_use_case = ExtractTextFromDocumentUseCase(utilities_repository)

        # Ejecutar el caso de uso
        return await extract_text_use_case.execute(file)
    except HTTPException as e:
        # Re-lanzar la excepción si proviene del caso de uso
        raise e
    except Exception as e:
        # Manejar cualquier otra excepción
        raise HTTPException(status_code=500, detail=f"Error al extraer texto del documento: {str(e)}")
