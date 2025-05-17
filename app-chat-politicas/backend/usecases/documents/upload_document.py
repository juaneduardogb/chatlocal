import json
from domain.documents.interfaces.documents_repository import DocumentsRepositoryInterface
from domain.documents.entities.body import DocumentCreationForm
from domain.documents.entities.documents import DocumentKnowledge
from domain.documents.entities.documents import KnowledgeBase
from domain.embeddings.entities.embeddings import DocumentEmbedding
from constants import settings, openai_client
from service.genai_shared.embeddings import generate_embeddings_with_metadata
from fastapi import HTTPException


class UploadDocumentUseCase:
    """Caso de uso para subir un documento"""

    def __init__(self, repository: DocumentsRepositoryInterface):
        self.repository = repository

    async def execute(self, document: DocumentCreationForm, current_user_email: str) -> DocumentKnowledge:
        """
        Ejecuta el caso de uso para subir un documento

        Args:
            document: Formulario con los datos del documento
            current_user_email: Email del usuario actual

        Returns:
            Documento creado

        Raises:
            HTTPException: Si la base de conocimientos no existe o el usuario no tiene acceso
        """
        # Verificamos que la base de conocimientos exista y pertenezca al usuario
        knowledge_base = await KnowledgeBase.find_one(
            KnowledgeBase.knowledgeId == document.knowledgeBase.knowledgeId, KnowledgeBase.author == current_user_email
        )
        if not knowledge_base:
            raise HTTPException(status_code=404, detail="La base de conocimientos no existe o no tienes acceso a ella")

        # Creamos el documento con el autor actual (el usuario autenticado)
        document_knowledge = DocumentKnowledge(
            documentName=document.documentName,
            author=current_user_email,  # Establecemos el autor como el usuario autenticado
            los=document.los,
            losOwner=document.losOwner,
            subLoS=document.subLoS,
            labels=document.labels,
            support=document.support,
            statuses=document.statuses,
            profiles=document.profiles,
            knowledgeBase=document.knowledgeBase,
            sizeFormatted=document.sizeFormatted,
            size=document.size,
            documentUrl=document.documentUrl,
            documentUniqueName=document.documentUniqueName,
            content=document.content,
            tagsByAuthor=document.tagsByAuthor,
            typeOfWorkday=document.typeOfWorkday,
            contractType=document.contractType,
        )

        # Generamos el resumen y los metadatos
        summary, meta_data = await self._get_summary_and_metadata(document_knowledge)

        document_knowledge.metaData = meta_data
        document_knowledge.summary = summary

        # Guardamos el documento
        await document_knowledge.insert()

        # Generamos los embeddings
        await generate_embeddings_with_metadata(document_knowledge, original_content=document.content)

        return document_knowledge

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
