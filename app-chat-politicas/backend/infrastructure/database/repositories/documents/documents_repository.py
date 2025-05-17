from typing import List, Optional
from domain.documents.interfaces.documents_repository import DocumentsRepositoryInterface
from domain.documents.entities.documents import DocumentKnowledge, KnowledgeBase


class DocumentsRepository(DocumentsRepositoryInterface):
    """Implementación del repositorio de documentos"""

    async def get_documents_by_user(self, user_email: str) -> List[DocumentKnowledge]:
        """
        Obtiene todos los documentos de un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Lista de documentos del usuario
        """
        # Primero obtenemos todas las bases de conocimiento del usuario
        knowledge_bases = await KnowledgeBase.find(KnowledgeBase.author == user_email).to_list()

        all_documents = []

        # Luego obtenemos todos los documentos asociados a esas bases de conocimiento
        for knowledge_base in knowledge_bases:
            documents = await DocumentKnowledge.find(DocumentKnowledge.knowledgeBase.knowledgeId == knowledge_base.knowledgeId).to_list()
            all_documents.extend(documents)

        return all_documents

    async def get_document_by_id(self, document_id: str) -> Optional[DocumentKnowledge]:
        """
        Obtiene un documento por su ID

        Args:
            document_id: ID del documento

        Returns:
            Documento si existe, None si no existe
        """
        return await DocumentKnowledge.find_one(DocumentKnowledge.documentId == document_id)

    async def save_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """
        Guarda un documento

        Args:
            document: Documento a guardar

        Returns:
            Documento guardado
        """
        await document.save()
        return document

    async def update_document(self, document_id: str, document_data: dict) -> Optional[DocumentKnowledge]:
        """
        Actualiza un documento

        Args:
            document_id: ID del documento
            document_data: Datos a actualizar

        Returns:
            Documento actualizado si existe, None si no existe
        """
        document = await self.get_document_by_id(document_id)
        if not document:
            return None

        # Actualizar solo los campos proporcionados
        for key, value in document_data.items():
            setattr(document, key, value)

        await document.save()
        return document

    async def delete_document(self, document_id: str) -> bool:
        """
        Elimina un documento

        Args:
            document_id: ID del documento

        Returns:
            True si se eliminó correctamente, False si no existe
        """
        document = await self.get_document_by_id(document_id)
        if not document:
            return False

        await document.delete()
        return True

    async def get_knowledge_bases_by_user(self, user_email: str) -> List[KnowledgeBase]:
        """
        Obtiene todas las bases de conocimiento de un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Lista de bases de conocimiento del usuario
        """
        return await KnowledgeBase.find(KnowledgeBase.author == user_email).to_list()
