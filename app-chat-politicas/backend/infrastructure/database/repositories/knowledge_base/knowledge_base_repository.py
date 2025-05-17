from typing import List, Optional
from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase


class KnowledgeBaseRepository(KnowledgeBaseRepositoryInterface):
    """Implementación del repositorio de knowledge base"""

    async def get_knowledge_base_by_id(self, knowledge_id: str) -> Optional[KnowledgeBase]:
        """
        Obtiene una base de conocimiento por su ID

        Args:
            knowledge_id: ID de la base de conocimiento

        Returns:
            Base de conocimiento si existe, None si no existe
        """
        return await KnowledgeBase.find_one(KnowledgeBase.knowledgeId == knowledge_id)

    async def get_documents_from_knowledge_base(self, knowledge_id: str, user_email: str) -> List[DocumentKnowledge]:
        """
        Obtiene todos los documentos de una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento
            user_email: Email del usuario para verificar acceso

        Returns:
            Lista de documentos de la base de conocimiento

        Raises:
            ValueError: Si el usuario no tiene acceso a la base de conocimiento
        """
        # Verificar si la base de conocimiento existe
        knowledge_base = await self.get_knowledge_base_by_id(knowledge_id)
        if not knowledge_base:
            raise ValueError("La base de conocimientos no existe.")

        # Verificar si el usuario tiene acceso a la base de conocimiento
        if knowledge_base.author != user_email:
            raise ValueError("No tienes acceso para consultar esta base de conocimientos.")

        # Obtener los documentos de la base de conocimiento
        documents = await DocumentKnowledge.find(DocumentKnowledge.knowledgeBase.knowledgeId == knowledge_id).to_list()

        return documents

    async def save_knowledge_base(self, knowledge_base: KnowledgeBase) -> KnowledgeBase:
        """
        Guarda una base de conocimiento

        Args:
            knowledge_base: Base de conocimiento a guardar

        Returns:
            Base de conocimiento guardada
        """
        await knowledge_base.save()
        return knowledge_base

    async def update_knowledge_base(self, knowledge_id: str, knowledge_data: dict) -> Optional[KnowledgeBase]:
        """
        Actualiza una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento
            knowledge_data: Datos a actualizar

        Returns:
            Base de conocimiento actualizada si existe, None si no existe
        """
        knowledge_base = await self.get_knowledge_base_by_id(knowledge_id)
        if not knowledge_base:
            return None

        # Actualizar solo los campos proporcionados
        for key, value in knowledge_data.items():
            setattr(knowledge_base, key, value)

        await knowledge_base.save()
        return knowledge_base

    async def delete_knowledge_base(self, knowledge_id: str) -> bool:
        """
        Elimina una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento

        Returns:
            True si se eliminó correctamente, False si no existe
        """
        knowledge_base = await self.get_knowledge_base_by_id(knowledge_id)
        if not knowledge_base:
            return False

        await knowledge_base.delete()
        return True
