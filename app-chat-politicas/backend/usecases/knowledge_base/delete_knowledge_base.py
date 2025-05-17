from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import KnowledgeBase, DocumentKnowledge
from domain.embeddings.entities.embeddings import DocumentEmbedding
from fastapi import HTTPException


class DeleteKnowledgeBaseUseCase:
    """Caso de uso para eliminar una base de conocimiento"""

    def __init__(self, repository: KnowledgeBaseRepositoryInterface):
        self.repository = repository

    async def execute(self, knowledge_id: str, current_user_email: str) -> KnowledgeBase:
        """
        Ejecuta el caso de uso para eliminar una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento a eliminar
            current_user_email: Email del usuario actual

        Returns:
            Base de conocimiento eliminada

        Raises:
            HTTPException: Si la base de conocimiento no existe o el usuario no tiene permisos
        """
        # Buscar la base de conocimientos
        kb = await KnowledgeBase.find_one(KnowledgeBase.knowledgeId == knowledge_id)
        if not kb:
            raise HTTPException(status_code=404, detail="Base de conocimiento no encontrada")

        # Verificar que el usuario sea el autor de la base de conocimientos
        if kb.author != current_user_email:
            raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta base de conocimiento")

        # Buscar todos los documentos asociados a esta base de conocimientos
        docs = await DocumentKnowledge.find(DocumentKnowledge.knowledgeBase.knowledgeId == knowledge_id).to_list()

        # Eliminar todos los documentos asociados
        for doc in docs:
            # Eliminar los embeddings de cada documento
            await DocumentEmbedding.find(DocumentEmbedding.document_id == doc.uniqueProcessID).delete()
            # Eliminar el documento
            await doc.delete()

        # Eliminar la base de conocimientos
        await kb.delete()

        return kb
