from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

import numpy as np
import pymongo
from constants import openai_client, settings
from domain.chat.entities.chat import ChatHistory, ChatSession, UserChatsView
from domain.chat.interfaces.chat_repository import ChatRepositoryInterface
from domain.documents.entities.documents import DocumentKnowledge
from domain.embeddings.entities.embeddings import DocumentEmbedding
from sklearn.metrics.pairwise import cosine_similarity
from infrastructure.services.genai.embeddings import generate_embedding_from_text


class ChatRepository(ChatRepositoryInterface):
    """Implementación del repositorio de chat"""

    async def retrieve_chat_history(self, session_id: str) -> ChatHistory | None:
        """
        Recupera el historial de chat para una sesión específica.

        Args:
            session_id: ID de la sesión de chat

        Returns:
            El historial de chat o None si no existe
        """
        results = await ChatHistory.find_one(ChatHistory.sessionId == session_id)
        if results is not None:
            return results.chatHistory
        else:
            results = await ChatHistory(sessionId=session_id).save()
            return results.chatHistory

    async def get_relevant_documents(self, query: str) -> list:
        """
        Obtiene los documentos más relevantes basados en la consulta del usuario.

        Args:
            query: La consulta del usuario en texto plano

        Returns:
            Una lista de documentos relevantes con su contenido
        """
        try:
            # Generar el embedding para la consulta
            query_embedding = await generate_embedding_from_text(query)

            documents = (
                await DocumentEmbedding.find()
                .sort(
                    [
                        (DocumentEmbedding.lastUpdate, pymongo.DESCENDING),
                    ]
                )
                .to_list()
            )

            if not documents:
                return []

            embeddings_list = np.array([doc.embedding for doc in documents])

            similarities = cosine_similarity([query_embedding], embeddings_list)

            # Establecer el umbral de similaridad
            similarity_threshold = 0.3

            # Encontrar todas las similaridades que cumplen con el umbral
            valid_indices = np.where(similarities[0] >= similarity_threshold)[0]

            if valid_indices.size == 0:
                return []

            # Ordenar los índices por la similitud en orden descendente
            sorted_indices = valid_indices[np.argsort(similarities[0][valid_indices])[::-1]]

            # Tomar un máximo de 5 documentos
            top_indices = sorted_indices[:5]

            # Preparar los documentos relevantes
            relevant_documents = []

            for i, idx in enumerate(top_indices):
                document_embedding: DocumentEmbedding = documents[idx]
                document: DocumentKnowledge = await DocumentKnowledge.find_one(
                    DocumentKnowledge.uniqueProcessID == document_embedding.documentUniqueProcessID
                )

                if document:
                    relevant_documents.append(
                        {
                            "title": document.documentName,
                            "content": document_embedding.contentChunk,
                            "similarity": float(similarities[0][idx]),
                            "document_id": str(document.id),
                            "document_url": document.documentUrl,
                        }
                    )

            return relevant_documents

        except Exception as e:
            print(f"Error al obtener documentos relevantes: {str(e)}")
            return []

    async def save_chat_session(self, chat_session: ChatSession) -> ChatSession:
        """
        Guarda una sesión de chat en la base de datos.
        Si la sesión ya existe, se actualizará.

        Args:
            chat_session: La sesión de chat a guardar

        Returns:
            La sesión de chat guardada
        """
        existing_session = await ChatSession.find_one(ChatSession.chatId == chat_session.chatId)

        if existing_session:
            # Update existing session
            existing_session.messages = chat_session.messages
            existing_session.updatedAt = datetime.now()
            if chat_session.title:
                existing_session.title = chat_session.title
            return await existing_session.save()
        else:
            # Create new session
            return await chat_session.save()

    async def get_chat_session(self, chat_id: str) -> Optional[ChatSession]:
        """
        Recupera una sesión de chat por su ID.

        Args:
            chat_id: ID de la sesión de chat

        Returns:
            La sesión de chat o None si no existe
        """
        return await ChatSession.find_one(ChatSession.chatId == chat_id)

    async def get_user_chat_sessions(self, user_email: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Recupera todas las sesiones de chat de un usuario, categorizadas por período de tiempo.

        Args:
            user_email: Email del usuario

        Returns:
            Diccionario con las sesiones de chat categorizadas
        """
        sessions = await ChatSession.find(ChatSession.userEmail == user_email).sort(-ChatSession.updatedAt).project(UserChatsView).to_list()

        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)

        categorized_sessions = {"today": [], "yesterday": [], "lastWeek": [], "lastMonth": [], "older": []}

        for session in sessions:
            session_dict = session.model_dump()
            session_date = session.updatedAt

            if session_date >= today:
                categorized_sessions["today"].append(session_dict)
            elif session_date >= yesterday:
                categorized_sessions["yesterday"].append(session_dict)
            elif session_date >= last_week:
                categorized_sessions["lastWeek"].append(session_dict)
            elif session_date >= last_month:
                categorized_sessions["lastMonth"].append(session_dict)
            else:
                categorized_sessions["older"].append(session_dict)

        return categorized_sessions

    async def delete_chat_session(self, chat_id: str, user_email: str) -> bool:
        """
        Elimina una sesión de chat por su ID y el email del usuario.

        Args:
            chat_id: ID de la sesión de chat
            user_email: Email del usuario

        Returns:
            True si la sesión fue eliminada, False en caso contrario
        """
        session = await ChatSession.find_one((ChatSession.chatId == chat_id) and (ChatSession.userEmail == user_email))

        if session is not None:
            await session.delete()
            return True
        return False
