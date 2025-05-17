from datetime import datetime, timedelta
import logging
import traceback

from constants import settings
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse, StreamingResponse
from middlewares.rate_limit import limiter, request_timestamps
from domain.chat.entities.chat import (
    ChatSession,
    MessageRating,
    AppChatMessages,
    SaveChatRequest,
    RenameChatRequest,
)
from pydantic import BaseModel

from slowapi.util import get_remote_address

from app.api.dependencies import (
    get_save_chat_session_usecase,
    get_user_chat_sessions_usecase,
    get_delete_chat_session_usecase,
    get_chat_session_usecase,
    get_chat_response_usecase,
    get_download_chat_usecase,
    get_rate_message_usecase,
    get_current_user_and_token,
)

# Configurar el logger
logger = logging.getLogger(__name__)


class ClientAttachment(BaseModel):
    name: str
    contentType: str
    url: str


class ToolInvocation(BaseModel):
    toolCallId: str
    toolName: str
    args: dict
    result: dict


chat_router = APIRouter(tags=["Chat"])


class EventMessage(BaseModel):
    id: str
    timestamp: datetime
    type: str
    message: str


@chat_router.post("/")
async def get_chat_response(
    request: Request,
    app_chat_history: AppChatMessages = Body(...),
    chat_response_usecase=Depends(get_chat_response_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Endpoint para obtener una respuesta del chat, manteniendo el contexto de la conversación.
    Utiliza RAG (Retrieval Augmented Generation) para mejorar las respuestas con información relevante.
    """
    try:
        user_email, _ = user_data

        # Delegar la lógica al caso de uso
        response_stream = chat_response_usecase.execute(chat_id=app_chat_history.chatId, messages=app_chat_history.messages)

        return StreamingResponse(
            response_stream,
            media_type="text/event-stream",
            headers={'nosniff': 'no', "Connection": "keep-alive"},
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en get_chat_response: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al procesar la solicitud de chat")


@chat_router.get("/chat-requests")
async def get_chat_requests(request: Request):
    try:
        user_ip = get_remote_address(request)
        request_count = len([timestamp for timestamp in request_timestamps[user_ip] if timestamp > datetime.utcnow() - timedelta(days=1)])

        return {
            "requests_last_24_hours": request_count,
            "max_requests_per_ip": settings.MAX_REQUEST_PER_IP,
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en get_chat_requests: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al obtener las solicitudes de chat")


@chat_router.post("/save-chat")
async def save_chat(
    request: Request,
    save_chat_request: SaveChatRequest = Body(...),
    save_chat_session_usecase=Depends(get_save_chat_session_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Save a chat session with all its messages.
    """
    try:
        user_email, _ = user_data

        # Verificar que el usuario sea el mismo que envía la solicitud
        if save_chat_request.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para guardar este chat")

        chat_session = ChatSession(
            chatId=save_chat_request.chatId,
            userEmail=save_chat_request.userEmail,
            messages=save_chat_request.messages,
            title=save_chat_request.title,
            updatedAt=datetime.now(),
        )

        saved_session = await save_chat_session_usecase.execute(chat_session)
        return {"success": True, "chatId": saved_session.chatId}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en save_chat: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al guardar el chat")


@chat_router.get("/user-chats")
async def get_user_chats(
    request: Request,
    user_chat_sessions_usecase=Depends(get_user_chat_sessions_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Get all chat sessions for a user, categorized by time period.
    """
    try:
        current_user_email, _ = user_data
        categorized_sessions = await user_chat_sessions_usecase.execute(current_user_email)
        return categorized_sessions
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en get_user_chats: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al recuperar los chats del usuario")


@chat_router.delete("/{chat_id}")
async def delete_chat(
    request: Request,
    chat_id: str,
    delete_chat_session_usecase=Depends(get_delete_chat_session_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Delete a chat session by its ID and user email.
    """
    try:
        current_user_email, _ = user_data

        success = await delete_chat_session_usecase.execute(chat_id, current_user_email)
        if success:
            return {"success": True, "message": "Chat deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chat not found or you don't have permission to delete it")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en delete_chat: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al eliminar el chat")


@chat_router.get("/{chat_id}")
async def get_chat(
    request: Request, chat_id: str, chat_session_usecase=Depends(get_chat_session_usecase), user_data: tuple = Depends(get_current_user_and_token)
):
    """
    Get a chat session by its ID.
    """
    try:
        user_email, _ = user_data

        chat_session = await chat_session_usecase.execute(chat_id)
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Verificar que el usuario tenga acceso al chat
        if chat_session.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para ver este chat")

        return chat_session.model_dump()
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en get_chat: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al recuperar el chat")


@chat_router.post("/rename-chat")
async def rename_chat(
    request: Request,
    rename_request: RenameChatRequest = Body(...),
    chat_session_usecase=Depends(get_chat_session_usecase),
    save_chat_session_usecase=Depends(get_save_chat_session_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Rename a chat session.
    """
    try:
        user_email, _ = user_data

        # Verificar que el usuario sea el mismo que envía la solicitud
        if rename_request.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para renombrar chats de otro usuario")

        chat_session = await chat_session_usecase.execute(rename_request.chatId)

        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat not found")

        if chat_session.userEmail != rename_request.userEmail:
            raise HTTPException(status_code=403, detail="You don't have permission to rename this chat")

        chat_session.title = rename_request.title
        await save_chat_session_usecase.execute(chat_session)

        return {"success": True, "message": "Chat renamed successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en rename_chat: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al renombrar el chat")


@chat_router.post("/rate-message")
async def rate_message(
    request: Request,
    rating_request: MessageRating = Body(...),
    rate_message_usecase=Depends(get_rate_message_usecase),
    user_data: tuple = Depends(get_current_user_and_token),
):
    """
    Endpoint para guardar la calificación de un mensaje.

    Args:
        request: La solicitud HTTP
        rating_request: La solicitud de calificación del mensaje

    Returns:
        Un diccionario con un mensaje de éxito
    """
    try:
        user_email, _ = user_data

        # Verificar que el usuario sea el mismo que envía la solicitud
        if rating_request.userEmail != user_email:
            raise HTTPException(status_code=403, detail="No tienes permiso para calificar mensajes de otro usuario")

        # Delegar la lógica al caso de uso
        result = await rate_message_usecase.execute(rating_request)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en rate_message: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al calificar el mensaje")


@chat_router.get("/download/{chat_id}", response_class=PlainTextResponse)
async def download_chat(
    request: Request, chat_id: str, download_chat_usecase=Depends(get_download_chat_usecase), user_data: tuple = Depends(get_current_user_and_token)
):
    """
    Endpoint para descargar un chat en formato texto.
    El formato será:
    1. Usuario: TEXTO DEL MENSAJE
    2. Sistema: Respuesta del sistema
    3. Break line del mensaje "==========="
    """
    try:
        user_email, _ = user_data

        # Delegar la lógica al caso de uso
        text_content, file_name = await download_chat_usecase.execute(chat_id, user_email)

        # Configurar los headers para la descarga
        headers = {"Content-Disposition": f"attachment; filename={file_name}"}

        return PlainTextResponse(content=text_content, headers=headers)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error en download_chat: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error al descargar el chat")
