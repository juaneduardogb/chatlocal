from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

from domain.documents.entities.document_knowledge import DocumentKnowledge


class DocumentRepositoryInterface(ABC):
    """Interfaz para el repositorio de documentos"""

    @abstractmethod
    async def get_documents_by_user(self, user_email: str) -> List[DocumentKnowledge]:
        """Obtiene todos los documentos de un usuario"""
        pass

    @abstractmethod
    async def get_document_by_id(self, document_id: str) -> Optional[DocumentKnowledge]:
        """Obtiene un documento por su ID"""
        pass

    @abstractmethod
    async def create_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """Crea un nuevo documento"""
        pass

    @abstractmethod
    async def update_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """Actualiza un documento existente"""
        pass

    @abstractmethod
    async def delete_document(self, document_id: str, user_email: str) -> bool:
        """Elimina un documento"""
        pass

    @abstractmethod
    async def generate_summary_and_metadata(self, document: DocumentKnowledge) -> Dict[str, Any]:
        """Genera un resumen y metadatos para un documento"""
        pass
