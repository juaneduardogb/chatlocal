from typing import List, Dict, Any
from domain.documents.interfaces.documents_repository import DocumentsRepositoryInterface
from domain.documents.entities.documents import DocumentKnowledge
from domain.documents.entities.responses import DocumentsByUserResponse


class GetDocumentsByUserUseCase:
    """Caso de uso para obtener todos los documentos de un usuario con estadísticas"""

    def __init__(self, repository: DocumentsRepositoryInterface):
        self.repository = repository

    async def execute(self, user_email: str) -> DocumentsByUserResponse:
        """
        Ejecuta el caso de uso para obtener todos los documentos de un usuario con estadísticas

        Args:
            user_email: Email del usuario

        Returns:
            Respuesta con los documentos y estadísticas
        """
        # Obtener los documentos del usuario
        documents = await self.repository.get_documents_by_user(user_email)

        # Calcular estadísticas
        all_published = len([doc for doc in documents if doc.isPublished])
        all_pending = len([doc for doc in documents if doc.isPublished is False])

        # Crear respuesta
        return DocumentsByUserResponse(documents=documents, totalDocuments=len(documents), totalPublished=all_published, totalPending=all_pending)
