from datetime import datetime, timedelta
from uuid import uuid4

from azure.storage.blob import BlobSasPermissions, generate_blob_sas
from azure.storage.blob.aio import BlobServiceClient
from constants import settings
from fastapi import UploadFile


async def format_size(byte_size: int | float):
    """
    The function `format_size` converts a given byte size into a human-readable format in kilobytes
    (KB), megabytes (MB), or gigabytes (GB).

    :param byte_size: The `format_size` function you provided takes a `byte_size` parameter as input and
    converts it into kilobytes (KB), megabytes (MB), or gigabytes (GB) depending on the size
    :type byte_size: int
    :return: a formatted string representing the size in either gigabytes (GB), megabytes (MB), or
    kilobytes (KB) based on the input byte size.
    """
    kb_size = byte_size / 1024
    mb_size = kb_size / 1024
    gb_size = mb_size / 1024

    if gb_size >= 1:
        return f"{gb_size:.2f} GB"
    elif mb_size >= 1:
        return f"{mb_size:.2f} MB"
    else:
        return f"{kb_size:.2f} KB"


async def upload_to_azure(file: UploadFile, file_name: str) -> dict:
    blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_BLOB_CONNECTION_STRING, connection_verify=False)

    unique_name = str(uuid4()).split("-")[-1].upper() + "-" + file_name.upper().strip()

    async with blob_service_client:

        container_client = blob_service_client.get_container_client(settings.AZ_BLOB_CONTAINER_NAME)

        blob_client = container_client.get_blob_client(unique_name)
        await blob_client.upload_blob(file)

        pdf_url = await generate_new_url_document(uniqueName=unique_name)

        return {"pdf_url": pdf_url, "unique_name": unique_name}


async def generate_new_url_document(uniqueName: str) -> str:

    sas_token = generate_blob_sas(
        account_name=settings.AZ_BLOB_ACCOUNT_NAME,
        container_name=settings.AZ_BLOB_CONTAINER_NAME,
        blob_name=uniqueName,
        account_key=settings.AZ_BLOB_ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(weeks=4),
    )
    sas_url = f"https://{settings.AZ_BLOB_ACCOUNT_NAME}.blob.core.windows.net/{settings.AZ_BLOB_CONTAINER_NAME}/{uniqueName}?{sas_token}"

    return sas_url
