import json
from datetime import datetime
from domain.documents.interfaces.documents_repository import DocumentsRepositoryInterface
from domain.documents.entities.body import DocumentUpdate
from domain.documents.entities.documents import DocumentKnowledge, DocumentStatus, DocumentStatusItem, KnowledgeBase
from domain.embeddings.entities.embeddings import DocumentEmbedding
from constants import settings, openai_client
from service.genai_shared.embeddings import generate_embeddings_with_metadata
from fastapi import HTTPException


class UpdateDocumentUseCase:
    """Caso de uso para actualizar un documento"""

    def __init__(self, repository: DocumentsRepositoryInterface):
        self.repository = repository

    async def execute(self, document_update: DocumentUpdate, current_user_email: str) -> DocumentKnowledge:
        """
        Ejecuta el caso de uso para actualizar un documento

        Args:
            document_update: Datos de actualización del documento
            current_user_email: Email del usuario actual

        Returns:
            Documento actualizado

        Raises:
            HTTPException: Si el documento no existe o el usuario no tiene permisos
        """
        TODAY = datetime.now()

        # Intentamos encontrar el documento utilizando el uniqueProcessID proporcionado
        document = await DocumentKnowledge.find_one(DocumentKnowledge.uniqueProcessID == document_update.uniqueProcessID)

        # Si no encontramos el documento, lanzamos una excepción HTTP 404
        if not document:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Document not found"})

        # Verificamos que el usuario sea el autor del documento o esté en la lista de usuarios permitidos de la base de conocimientos
        knowledge_base = await KnowledgeBase.find_one(
            KnowledgeBase.knowledgeId == document.knowledgeBase.knowledgeId and KnowledgeBase.author == current_user_email
        )

        if not knowledge_base:
            raise HTTPException(status_code=404, detail="Base de conocimiento no encontrada")

        # Actualizamos los campos del documento con los nuevos valores
        update_fields = {
            "documentName": document_update.documentName,
            "summary": document_update.summary,
            "los": document_update.los,
            "profiles": document_update.profile,
            "losOwner": document_update.losOwner,
            "subLoS": document_update.subLoS,
            "support": document_update.supportPersons,
            "labels": document_update.labels,
            "tagsByAuthor": document_update.tagsByAuthor,
            "typeOfWorkday": document_update.typeOfWorkday,
            "contractType": document_update.contractType,
            "lastUpdate": TODAY,
        }

        # Aplicamos las actualizaciones a los campos del documento
        for field, value in update_fields.items():
            setattr(document, field, value)

        # Si el documento debe ser publicado, actualizamos los estados
        if document_update.publish:
            status_item = DocumentStatusItem(confirmation=True, date=TODAY, person=document_update.modifiedBy)
            document.statuses = DocumentStatus(
                labels=status_item,
                access=status_item,
                owners=status_item,
                support=status_item,
                publish=status_item,
            )
            document.isPublished = True

        # Guardamos los cambios en el documento
        await document.save_changes()

        # Generamos nuevos resumen y metadatos
        summary, meta_data = await self._get_summary_and_metadata(document)

        document.metaData = meta_data
        document.summary = summary
        await document.save_changes()

        # Eliminamos los embeddings anteriores del documento
        await DocumentEmbedding.find(DocumentEmbedding.documentUniqueProcessID == document.uniqueProcessID).delete()

        # Generamos nuevos embeddings para el documento
        await generate_embeddings_with_metadata(document, document.content)

        return document

    async def _get_summary_and_metadata(self, document: DocumentKnowledge):
        """
        Genera un resumen y metadatos para el documento

        Args:
            document: Documento para el cual generar el resumen y metadatos

        Returns:
            Tupla con el resumen y los metadatos
        """
        response = await openai_client.chat.completions.create(
            model="azure.gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """
                    ### Instrucciones
                    Eres un asistente IA, tu único objetivo es siempre resumir el contenido en español de manera profesional, de manera breve en menos de 200 palabras. Además deberás por cada atributo en el listado de 'labels' buscar dentro del contenido lo solicitado en modo de búsqueda, por ejemplo: Si existe un tag con el valor 'Persona', deberás buscar todas las personas mencionadas en el documento. 
                    
                    ### Formato de respuesta
                    1. Devolver un JSON con dos atributos
                        1.1 atributo 'summary' todo en español con un máximo de 200 palabras
                        1.2 atributo 'meta_data' que sera un Array de objetos que tengan la siguiente estructura:
                            1.2.1 la key del diccionario debe ser el nombre del label según corresponda, por ejemplo si el label se llama "personas" el key se debe llamar igual.
                            1.2.2 el value debe ser todas las coincidencias encontradas según la instrucción, en el caso de NO encontrar coincidencias dejar el valor 'Sin Información'
                            1.2.3 la key del diccionario debe estar en lowercase y los espacios en blanco se reemplazan por _
                        1.3 Devulve el string JSON válido para puedo realizar un parse, por lo cual no añadas triple comillas.
                    """,
                },
                {
                    "role": "user",
                    "content": f"""
                    ### Contenido a resumir: 
                    {document.content[0:600]}

                    ### Labels
                    {", ".join(map(lambda label: label.label, document.labels))}
                    """,
                },
            ],
            **settings.DEFAULT_MODEL_ARGS,
        )
        response_parsed = json.loads(response.choices[0].message.content)
        summary = response_parsed["summary"]
        meta_data = response_parsed["meta_data"]

        return summary, meta_data
