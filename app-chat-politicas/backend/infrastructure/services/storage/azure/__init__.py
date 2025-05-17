from datetime import datetime, timedelta
from uuid import uuid4

from azure.storage.blob import BlobSasPermissions, generate_blob_sas
from azure.storage.blob.aio import BlobServiceClient
from constants import settings


async def upload_to_azure(content: bytes, file_name: str) -> dict:
    """
    Sube un archivo a Azure Blob Storage.

    Args:
        content: Contenido del archivo en bytes
        file_name: Nombre del archivo

    Returns:
        Diccionario con la URL del archivo y el nombre único
    """
    blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_BLOB_CONNECTION_STRING, connection_verify=False)

    unique_name = str(uuid4()).split("-")[-1].upper() + "-" + file_name.upper().strip()

    async with blob_service_client:
        container_client = blob_service_client.get_container_client(settings.AZ_BLOB_CONTAINER_NAME)
        blob_client = container_client.get_blob_client(unique_name)
        await blob_client.upload_blob(content)

        pdf_url = await generate_new_url_document(uniqueName=unique_name)

        return {"pdf_url": pdf_url, "unique_name": unique_name}


async def generate_new_url_document(uniqueName: str) -> str:
    """
    Genera una URL con SAS para acceder al documento.

    Args:
        uniqueName: Nombre único del documento

    Returns:
        URL con SAS para acceder al documento
    """
    # Generar SAS para acceso al blob
    sas_token = generate_blob_sas(
        account_name=settings.AZ_BLOB_ACCOUNT_NAME,
        container_name=settings.AZ_BLOB_CONTAINER_NAME,
        blob_name=uniqueName,
        account_key=settings.AZ_BLOB_ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=24),
    )

    # Construir URL completa
    blob_url = f"{settings.AZ_BLOB_ACCOUNT_URL}/{settings.AZ_BLOB_CONTAINER_NAME}/{uniqueName}?{sas_token}"

    return blob_url
