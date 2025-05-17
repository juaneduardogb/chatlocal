from constants import openai_client, settings


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
