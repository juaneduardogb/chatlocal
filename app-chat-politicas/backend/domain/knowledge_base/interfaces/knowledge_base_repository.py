from abc import ABC, abstractmethod
from typing import List, Optional

from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase


class KnowledgeBaseRepositoryInterface(ABC):
    """Interfaz para el repositorio de knowledge base"""

    @abstractmethod
    async def get_knowledge_base_by_id(self, knowledge_id: str) -> Optional[KnowledgeBase]:
        """
        Obtiene una base de conocimiento por su ID

        Args:
            knowledge_id: ID de la base de conocimiento

        Returns:
            Base de conocimiento si existe, None si no existe
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def save_knowledge_base(self, knowledge_base: KnowledgeBase) -> KnowledgeBase:
        """
        Guarda una base de conocimiento

        Args:
            knowledge_base: Base de conocimiento a guardar

        Returns:
            Base de conocimiento guardada
        """
        pass

    @abstractmethod
    async def update_knowledge_base(self, knowledge_id: str, knowledge_data: dict) -> Optional[KnowledgeBase]:
        """
        Actualiza una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento
            knowledge_data: Datos a actualizar

        Returns:
            Base de conocimiento actualizada si existe, None si no existe
        """
        pass

    @abstractmethod
    async def delete_knowledge_base(self, knowledge_id: str) -> bool:
        """
        Elimina una base de conocimiento

        Args:
            knowledge_id: ID de la base de conocimiento

        Returns:
            True si se eliminó correctamente, False si no existe
        """
        pass
