from typing import List, Optional

from domain.documents.entities.document_knowledge import DocumentKnowledge
from domain.documents.entities.knowledge_base import KnowledgeBase
from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface


class GetDocumentsFromKnowledgeBaseUseCase:
    """Caso de uso para obtener documentos de una base de conocimiento"""

    def __init__(self, knowledge_base_repository: KnowledgeBaseRepositoryInterface):
        self.knowledge_base_repository = knowledge_base_repository

    async def execute(self, knowledge_id: str, user_email: str) -> List[DocumentKnowledge]:
        """
        Ejecuta el caso de uso para obtener documentos de una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento
            user_email: Email del usuario

        Returns:
            Lista de documentos de la base de conocimiento

        Raises:
            ValueError: Si la base de conocimiento no existe o el usuario no tiene acceso
        """
        # Verificar que la base de conocimiento existe
        knowledge_base = await self.knowledge_base_repository.get_knowledge_base_by_id(knowledge_id)

        if not knowledge_base:
            raise ValueError("La base de conocimientos no existe.")

        # Obtener los documentos
        documents = await self.knowledge_base_repository.get_documents_from_knowledge_base(knowledge_id, user_email)
        return documents
