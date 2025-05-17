from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime
import uuid
import json

from domain.chat.entities.chat import ChatMessage, ChatSession
from constants import settings
from agno.agent import Agent
from agno.models.openai import OpenAIChat

from usecases.chat.get_relevant_documents import GetRelevantDocumentsUseCase


class GetChatResponseUseCase:
    """Caso de uso para obtener respuestas de chat"""

    def __init__(self, relevant_docs_usecase: GetRelevantDocumentsUseCase):
        self.relevant_docs_usecase = relevant_docs_usecase

    async def execute(self, chat_id: str, messages: List[ChatMessage]) -> AsyncGenerator[str, None]:
        """
        Ejecuta el caso de uso para obtener una respuesta de chat

        Args:
            chat_id: ID del chat
            messages: Lista de mensajes de chat

        Returns:
            Un generador asíncrono que produce fragmentos de la respuesta
        """
        # Obtener el último mensaje del usuario
        last_message = messages[-1]

        # Evento de inicio
        start_event = {
            "id": f"event_{uuid.uuid4()}",
            "timestamp": str(datetime.now()),
            "type": "message",
            "message": "Iniciando procesamiento de la consulta",
        }
        yield f"data: e: {json.dumps(start_event)} [END_MESSAGE]\n"

        # Evento de búsqueda de documentos
        search_event = {
            "id": f"event_{uuid.uuid4()}",
            "timestamp": str(datetime.now()),
            "type": "message",
            "message": "Buscando información relevante",
        }
        yield f"data: e: {json.dumps(search_event)} [END_MESSAGE]\n"

        # Evento de herramienta interna para documentos
        tool_id_internal_document_event = f"call_{uuid.uuid4()}"
        internal_document_event_tool = {
            "toolCallId": tool_id_internal_document_event,
            "toolName": "internal_document_event",
            "toolArgs": {},
            "state": "calling",
            "createdAt": str(datetime.now()),
            "result": None,
        }
        yield f"data: b: [{json.dumps(internal_document_event_tool)}] [END_MESSAGE]\n"

        # Obtener documentos relevantes
        relevant_docs = await self.relevant_docs_usecase.execute(last_message.content)

        # Construir contexto con documentos relevantes
        context = ""
        if relevant_docs and len(relevant_docs) > 0:
            context = "# Información relevante:\n\n ===\n\n"
            for i, doc in enumerate(relevant_docs[:3]):  # Limitamos a los 3 más relevantes
                document_title = doc.get("title", "N/A")
                document_url = doc.get("document_url", "N/A")
                document_content = doc.get("content", "N/A")
                context += f"Fuente {i+1}: \n url: {document_url}\n título del documento: {document_title}\n\nContenido de la fuente N {i+1}: ```{document_content}```\n\n "

        # Evento para indicar que se está generando la respuesta
        call_gpt_event = {
            "id": f"event_{uuid.uuid4()}",
            "timestamp": str(datetime.now()),
            "type": "message",
            "message": "Generando respuesta",
        }
        yield f"data: e: {json.dumps(call_gpt_event)} [END_MESSAGE]\n"

        # Definir el prompt del sistema
        system_prompt = """
        Tu objetivo es responder a la necesidad del usuario de la mejor manera posible. Teniendo
        en cuenta que la aplicación LLM deberá ser capaz de renderizar el contenido de la respuesta.
        Por lo que el markdown a generar deberá ser compatible con el renderizado de la aplicación.
        Además, el contenido deberá ser generado en español de Chile.
        
        Sigue estas pautas:
        1. Responde de manera clara, concisa y profesional, con un tono amigable.
        2. Mantén un tono amable y servicial en todo momento.
        3. No inventes información ni proporciones datos poco precisos.
        4. Utiliza el contexto de la conversación para proporcionar respuestas coherentes, si no existe
        información en el contexto, utiliza tu propio conocimiento.
        5. Evita añadir backtiks triples, responde directamente markdown.
        """

        # Formatea el historial de chat para las instrucciones del agente
        formatted_history = self._format_chat_history_for_instructions(messages)

        # Inicializar el agente
        agent = Agent(
            session_id=chat_id,
            model=OpenAIChat(id="azure.gpt-4o-mini", base_url=settings.OPENAI_API_BASE),
            markdown=True,
            instructions=f"""
            {system_prompt}

            Utiliza el siguiente contexto para responder a la pregunta del usuario, si es que la información encontrada en el contexto no es relevante, utiliza tu propio conocimiento:
            
            # Historial de conversación:
            {formatted_history}
            
            ===
            Fuentes
            ```
            {context}
            ```
            """,
        )

        # Ejecutar el agente y transmitir la respuesta
        response = agent.run(last_message.content, stream=True, show_full_reasoning=True)

        for message in response:
            yield f"data: 0: {message.content}[END_MESSAGE]\n"

        # Evento para mostrar las fuentes de los documentos
        tool_internal_document_result = {
            "toolCallId": tool_id_internal_document_event,
            "toolName": "internal_document_event",
            "toolArgs": {},
            "state": "result",
            "createdAt": str(datetime.now()),
            "result": [
                {
                    "document_url": reference["document_url"],
                    "document_name": reference["title"],
                }
                for reference in relevant_docs
            ],
        }
        yield f"data: b: {json.dumps(tool_internal_document_result)} [END_MESSAGE]\n"

        # Evento de finalización
        end_event = {
            "id": f"event_{uuid.uuid4()}",
            "timestamp": str(datetime.now()),
            "type": "message",
            "message": "Respuesta generada",
        }
        yield f"data: e: {json.dumps(end_event)} [END_MESSAGE]\n"

        # Señal de finalización del stream
        yield "data: [DONE]\n"

    def _format_chat_history_for_instructions(self, messages: List[ChatMessage]) -> str:
        """
        Formatea el historial de chat para las instrucciones del agente

        Args:
            messages: Lista de mensajes de chat

        Returns:
            Historial formateado como texto
        """
        formatted_history = ""
        for msg in messages:
            role = "Usuario" if msg.role == "user" else "Asistente"
            formatted_history += f"\n{role}: {msg.content}\n"
        return formatted_history
