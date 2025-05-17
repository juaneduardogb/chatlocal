from abc import ABC, abstractmethod
from typing import List, Optional

from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase


class DocumentsRepositoryInterface(ABC):
    """Interfaz para el repositorio de documentos"""

    @abstractmethod
    async def get_documents_by_user(self, user_email: str) -> List[DocumentKnowledge]:
        """
        Obtiene todos los documentos de un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Lista de documentos del usuario
        """
        pass

    @abstractmethod
    async def get_document_by_id(self, document_id: str) -> Optional[DocumentKnowledge]:
        """
        Obtiene un documento por su ID

        Args:
            document_id: ID del documento

        Returns:
            Documento si existe, None si no existe
        """
        pass

    @abstractmethod
    async def save_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """
        Guarda un documento

        Args:
            document: Documento a guardar

        Returns:
            Documento guardado
        """
        pass

    @abstractmethod
    async def update_document(self, document_id: str, document_data: dict) -> Optional[DocumentKnowledge]:
        """
        Actualiza un documento

        Args:
            document_id: ID del documento
            document_data: Datos a actualizar

        Returns:
            Documento actualizado si existe, None si no existe
        """
        pass

    @abstractmethod
    async def delete_document(self, document_id: str) -> bool:
        """
        Elimina un documento

        Args:
            document_id: ID del documento

        Returns:
            True si se eliminó correctamente, False si no existe
        """
        pass

    @abstractmethod
    async def get_knowledge_bases_by_user(self, user_email: str) -> List[KnowledgeBase]:
        """
        Obtiene todas las bases de conocimiento de un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Lista de bases de conocimiento del usuario
        """
        pass
