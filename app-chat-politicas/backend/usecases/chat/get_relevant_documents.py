from domain.chat.interfaces.chat_repository import ChatRepositoryInterface


class GetRelevantDocumentsUseCase:
    """Caso de uso para obtener documentos relevantes basados en una consulta"""

    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository

    async def execute(self, query: str) -> list:
        """
        Ejecuta el caso de uso para obtener documentos relevantes.

        Args:
            query: La consulta del usuario

        Returns:
            Lista de documentos relevantes
        """
        return await self.repository.get_relevant_documents(query)
