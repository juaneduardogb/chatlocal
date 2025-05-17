from domain.chat.interfaces.chat_repository import ChatRepositoryInterface

class GetChatUseCase:
    """Caso de uso para obtener chat"""
    
    def __init__(self, repository: ChatRepositoryInterface):
        self.repository = repository
    
    async def execute(self, id: str):
        """Ejecuta el caso de uso"""
        # Implementar según las necesidades del dominio
        pass
