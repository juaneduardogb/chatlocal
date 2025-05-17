from typing import List, Optional, Dict, Any
import base64

from domain.documents.interfaces.document_repository import DocumentRepositoryInterface
from domain.documents.entities.document_knowledge import DocumentKnowledge
from constants import settings, openai_client
from infrastructure.services.genai.embeddings import generate_embedding_from_text


class DocumentRepository(DocumentRepositoryInterface):
    """Implementación del repositorio de documentos"""

    async def get_documents_by_user(self, user_email: str) -> List[DocumentKnowledge]:
        """Obtiene todos los documentos de un usuario"""
        # En una implementación más completa, podríamos filtrar por usuario
        # Por ahora, devolvemos todos los documentos
        return await DocumentKnowledge.find().to_list()

    async def get_document_by_id(self, document_id: str) -> Optional[DocumentKnowledge]:
        """Obtiene un documento por su ID"""
        return await DocumentKnowledge.find_one({"uniqueProcessID": document_id})

    async def create_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """Crea un nuevo documento"""
        # Generar embedding para el documento
        if document.content:
            document.embedding = await generate_embedding_from_text(document.content)

        # Guardar el documento
        await document.save()
        return document

    async def update_document(self, document: DocumentKnowledge) -> DocumentKnowledge:
        """Actualiza un documento existente"""
        # Si el contenido ha cambiado, regenerar embedding
        existing_document = await self.get_document_by_id(document.uniqueProcessID)

        if existing_document and existing_document.content != document.content:
            document.embedding = await generate_embedding_from_text(document.content)

        # Guardar el documento
        await document.save()
        return document

    async def delete_document(self, document_id: str, user_email: str) -> bool:
        """Elimina un documento"""
        document = await self.get_document_by_id(document_id)
        if document:
            # En una implementación completa, verificar permisos del usuario
            await document.delete()
            return True
        return False

    async def generate_summary_and_metadata(self, document: DocumentKnowledge) -> Dict[str, Any]:
        """Genera un resumen y metadatos para un documento usando GPT"""
        try:
            # Preparar el prompt para generar el resumen
            summary_prompt = [
                {
                    "role": "system",
                    "content": "Eres un asistente especializado en resumir documentos. Genera un resumen conciso del siguiente documento.",
                },
                {"role": "user", "content": f"Resumir el siguiente documento en 3-5 párrafos:\n\n{document.content[:2000]}..."},
            ]

            # Obtener el resumen
            summary_response = await openai_client.chat.completions.create(
                model=settings.AZURE_GPT4_DEPLOYMENT_NAME, messages=summary_prompt, temperature=0.3, max_tokens=500
            )

            summary = summary_response.choices[0].message.content

            # Preparar el prompt para identificar metadatos
            metadata_prompt = [
                {
                    "role": "system",
                    "content": "Eres un asistente especializado en extraer metadatos de documentos. Identifica fechas, personas, organizaciones y temas principales del siguiente documento.",
                },
                {
                    "role": "user",
                    "content": f"Extrae metadatos del siguiente documento en formato JSON. Incluye fechas, personas, organizaciones y temas principales:\n\n{document.content[:2000]}...",
                },
            ]

            # Obtener los metadatos
            metadata_response = await openai_client.chat.completions.create(
                model=settings.AZURE_GPT4_DEPLOYMENT_NAME, messages=metadata_prompt, temperature=0.3, max_tokens=500
            )

            # Intentar parsear los metadatos como JSON
            metadata_text = metadata_response.choices[0].message.content

            # Extraer fechas, personas y organizaciones como listas
            metadata = [
                {"key": "resumen", "value": summary},
                {"key": "fecha_extraccion", "value": document.createdAt.isoformat()},
                {"key": "tamano", "value": document.sizeFormatted},
            ]

            # Dividir el texto de metadatos en secciones
            if "fecha" in metadata_text.lower() or "date" in metadata_text.lower():
                metadata.append({"key": "fechas", "value": "Se encontraron fechas en el documento"})

            if "persona" in metadata_text.lower() or "people" in metadata_text.lower():
                metadata.append({"key": "personas", "value": "Se encontraron nombres de personas en el documento"})

            if "organizacion" in metadata_text.lower() or "organization" in metadata_text.lower():
                metadata.append({"key": "organizaciones", "value": "Se encontraron nombres de organizaciones en el documento"})

            return {"summary": summary, "metadata": metadata}
        except Exception as e:
            print(f"Error al generar resumen y metadatos: {str(e)}")
            return {
                "summary": "No se pudo generar un resumen automático.",
                "metadata": [
                    {"key": "fecha_extraccion", "value": document.createdAt.isoformat()},
                    {"key": "tamano", "value": document.sizeFormatted},
                ],
            }
