from typing import List
from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import KnowledgeBase


class GetAllKnowledgeBaseUseCase:
    """Caso de uso para obtener todas las bases de conocimiento de un usuario"""

    def __init__(self, repository: KnowledgeBaseRepositoryInterface):
        self.repository = repository

    async def execute(self, user_email: str) -> List[KnowledgeBase]:
        """
        Ejecuta el caso de uso para obtener todas las bases de conocimiento de un usuario

        Args:
            user_email: Email del usuario

        Returns:
            Lista de bases de conocimiento del usuario
        """
        return await KnowledgeBase.find(KnowledgeBase.author == user_email).to_list()
