import json
from domain.knowledge_base.interfaces.knowledge_base_repository import KnowledgeBaseRepositoryInterface
from domain.documents.entities.documents import KnowledgeBase, DocumentKnowledge
from domain.documents.entities.body import KnowledgeMassiveConfiguration, DocumentUpdate
from domain.documents.entities.responses import MassiveConfResponse
from fastapi import HTTPException, Depends
from usecases.documents.update_document import UpdateDocumentUseCase


class MassiveKnowledgeConfigurationUseCase:
    """Caso de uso para configuración masiva de conocimiento"""

    def __init__(self, repository: KnowledgeBaseRepositoryInterface, update_document_usecase: UpdateDocumentUseCase):
        self.repository = repository
        self.update_document_usecase = update_document_usecase

    async def execute(self, knowledge_conf: KnowledgeMassiveConfiguration, current_user_email: str) -> MassiveConfResponse:
        """
        Ejecuta el caso de uso para configuración masiva de conocimiento

        Args:
            knowledge_conf: Configuración masiva a aplicar
            current_user_email: Email del usuario actual

        Returns:
            Respuesta de la configuración masiva

        Raises:
            HTTPException: Si la base de conocimiento no existe o el usuario no tiene permisos
        """
        # Verificar que el usuario sea el autor de la base de conocimientos
        kb = await KnowledgeBase.find_one(KnowledgeBase.knowledgeId == knowledge_conf.knowledgeId and KnowledgeBase.author == current_user_email)
        if not kb:
            raise HTTPException(status_code=404, detail="Base de conocimiento no encontrada")

        # Actualizar cada documento en la configuración masiva
        for document_id_selected_from_app in knowledge_conf.allDocumentsIds:
            document = await DocumentKnowledge.find_one(DocumentKnowledge.uniqueProcessID == document_id_selected_from_app)

            data_json = document.model_dump_json()
            data = json.loads(data_json)

            data_modified_from_massive_conf = {
                **data,
                "los": knowledge_conf.los,
                "subLoS": knowledge_conf.subLoS,
                "profile": knowledge_conf.profiles,
                "losOwner": knowledge_conf.losOwner,
                "supportPersons": knowledge_conf.support,
                "modifiedBy": knowledge_conf.modifiedBy,
                "typeOfWorkday": knowledge_conf.typeOfWorkday,
                "contractType": knowledge_conf.contractType,
                "publish": True,
            }

            document_update_instance = DocumentUpdate(**data_modified_from_massive_conf)

            await self.update_document_usecase.execute(document_update_instance, current_user_email)

        return {"detail": {"success": True, "message": "Se ha configurado correctamente "}}
