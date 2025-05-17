from domain.documents.interfaces.documents_repository import DocumentsRepositoryInterface
from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase
from domain.embeddings.entities.embeddings import DocumentEmbedding
from domain.documents.entities.responses import DeleteDocumentResponse
from fastapi import HTTPException


class DeleteDocumentUseCase:
    """Caso de uso para eliminar un documento"""

    def __init__(self, repository: DocumentsRepositoryInterface):
        self.repository = repository

    async def execute(self, document_id: str, current_user_email: str) -> DeleteDocumentResponse:
        """
        Ejecuta el caso de uso para eliminar un documento

        Args:
            document_id: ID del documento a eliminar
            current_user_email: Email del usuario actual

        Returns:
            Respuesta de confirmación de eliminación

        Raises:
            HTTPException: Si el documento no existe o el usuario no tiene permisos
        """
        # Buscamos el documento
        document = await DocumentKnowledge.find_one(DocumentKnowledge.uniqueProcessID == document_id)

        kb = await KnowledgeBase.find_one(
            KnowledgeBase.knowledgeId == document.knowledgeBase.knowledgeId and KnowledgeBase.author == current_user_email
        )

        if document is None:
            raise HTTPException(status_code=404, detail="Documento no encontrado.")

        if kb is None:
            raise HTTPException(status_code=403, detail="No tienes permiso para acceder a la base de conocimientos.")

        # Eliminamos las incrustaciones del documento
        await DocumentEmbedding.find(DocumentEmbedding.documentUniqueProcessID == document_id).delete()

        # Eliminamos el documento
        await document.delete()

        # Se actualiza el total de documentos de la base de conocimientos debido a la eliminación de un documento relacionado
        knowledge_base = await KnowledgeBase.find_one(KnowledgeBase.knowledgeId == document.knowledgeBase.knowledgeId)

        knowledge_base.totalDocuments = knowledge_base.totalDocuments - 1

        await knowledge_base.save_changes()

        return {
            "detail": {
                "success": True,
                "message": "Se ha eliminado correctamente el documento.",
            }
        }
