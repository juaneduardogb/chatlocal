from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import KnowledgeBase
from domain.documents.entities.body import KnowledgeBaseForm
from fastapi import HTTPException


class CreateKnowledgeBaseUseCase:
    """Caso de uso para crear una base de conocimiento"""

    def __init__(self, repository: KnowledgeBaseRepositoryInterface):
        self.repository = repository

    async def execute(self, knowledge_base_form: KnowledgeBaseForm, current_user_email: str) -> KnowledgeBase:
        """
        Ejecuta el caso de uso para crear una base de conocimiento

        Args:
            knowledge_base_form: Formulario con los datos de la base de conocimiento
            current_user_email: Email del usuario actual

        Returns:
            Base de conocimiento creada

        Raises:
            HTTPException: Si el usuario no tiene permisos para crear la base de conocimiento
        """
        # Verificamos que el usuario que crea la base sea el autor
        if knowledge_base_form.author != current_user_email:
            raise HTTPException(status_code=403, detail="No tienes permisos para crear bases de conocimiento con este autor")

        # Creamos la base de conocimiento
        new_kb = KnowledgeBase(**knowledge_base_form.dict())
        await new_kb.insert()
        return new_kb
