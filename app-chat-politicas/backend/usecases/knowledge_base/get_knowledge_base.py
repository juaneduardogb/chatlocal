from typing import Optional
from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import KnowledgeBase
from fastapi import HTTPException


class GetKnowledgeBaseUseCase:
    """Caso de uso para obtener una base de conocimiento por su ID"""

    def __init__(self, repository: KnowledgeBaseRepositoryInterface):
        self.repository = repository

    async def execute(self, knowledge_id: str, user_email: str) -> KnowledgeBase:
        """
        Ejecuta el caso de uso para obtener una base de conocimiento por su ID

        Args:
            knowledge_id: ID de la base de conocimiento
            user_email: Email del usuario para verificar acceso

        Returns:
            Base de conocimiento

        Raises:
            HTTPException: Si la base de conocimiento no existe o el usuario no tiene acceso
        """
        # Obtener la base de conocimiento
        knowledge_base = await self.repository.get_knowledge_base_by_id(knowledge_id)

        if not knowledge_base:
            raise HTTPException(status_code=404, detail="Base de conocimiento no encontrada")

        # Verificar que el usuario tenga acceso
        if knowledge_base.author != user_email and user_email not in knowledge_base.allowedUsers:
            raise HTTPException(status_code=403, detail="No tienes acceso a esta base de conocimiento")

        return knowledge_base
