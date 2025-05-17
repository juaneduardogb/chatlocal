from constants import openai_client, settings
from utils.embeddings import split_text
from domain.documents.entities.documents import DocumentKnowledge
from domain.embeddings.entities.embeddings import DocumentEmbedding


async def generate_embedding_from_text(content: str) -> list[float]:
    """
    Generate an embedding vector from the given text content using OpenAI's embedding model.

    Args:
        content (str): The text content to generate embeddings for. Newlines will be replaced with spaces.

    Returns:
        list[float]: A list of floating-point numbers representing the text embedding vector.

    Note:
        This function uses the Azure OpenAI API with the model specified in settings.AZURE_TEXT_EMBEDDING_MODEL_NAME.
        An API key must be configured in settings.OPENAI_API_KEY.
    """

    content = content.replace("\n", " ")
    response = await openai_client.embeddings.create(input=[content], model=settings.AZURE_TEXT_EMBEDDING_MODEL_NAME)

    return response.data[0].embedding


async def generate_embeddings_with_metadata(document: DocumentKnowledge, original_content: str):
    documents_content_chunks = split_text(text=original_content)

    # Creación del objeto document embedding para cada chunk de texto
    for chunk in documents_content_chunks:

        chunk_modified = f"""
        # Accesos del documento
        1. Línea de servicios: {", ".join(document.los)}

        # Cargos o categorías  que aplica el documento
        2. Cargos o categorías: {", ".join(document.profiles)}
        2.1 Tipo de jornada: {document.typeOfWorkday}
        2.2 Tipo de contrato: {document.contractType}

        # Dueño o owner del documento
        3. Línea de servicio del owner (los): {document.losOwner}
        3.1 Sub Línea de servicio del owner (sublos): {document.subLoS}

        # Soporte del documento
        4. Soporte:  {", ".join(map(lambda person: person.name, document.support))}

        # Etiquetas personalizadas
        5. Etiquetas: {", ".join(map(lambda tag: tag.label, document.tagsByAuthor))}

        ===
        Contenido del documento:
        {chunk}

        """

        chunk_embedding = await generate_embedding_from_text(content=chunk_modified)

        new_document_embedding = DocumentEmbedding(
            documentName=document.documentName,
            documentUniqueProcessID=document.uniqueProcessID,
            embedding=chunk_embedding,
            contentChunk=chunk_modified,
            knowledgeBaseId=document.knowledgeBase.id,
            profiles=document.profiles,
            los=document.los,
        )
        await new_document_embedding.insert()
