import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import routes from '@/constants/routes';
import { useAppStore } from '@/store/app';
import { useChatStore } from '@/store/chat/chat.store';
import { ChatSession } from '@/types/chat-session';

import { backendEndpoints } from '@/constants/backend-routes';

// Define a type that matches what comes from the API
export interface ApiChatSession extends Omit<ChatSession, 'title' | 'createdAt' | 'updatedAt'> {
    title: string | null;
    createdAt: string;
    updatedAt: string;
}

// Función auxiliar para convertir ApiChatSession a ChatSession
function convertApiToLocalSession(apiSession: ApiChatSession): unknown {
    return {
        ...apiSession,
        title: apiSession.title || undefined,
        createdAt: new Date(apiSession.createdAt),
        updatedAt: new Date(apiSession.updatedAt)
    };
}

export function useChatActions() {
    const { userName, setPinnedChatId, pinnedChatId, setSelectedChatId, userEmail, token } = useAppStore();
    const {
        isRenameModalOpen,
        isDeleteModalOpen,
        selectedChat,
        newTitle,
        setIsRenameModalOpen,
        setIsDeleteModalOpen,
        setSelectedChat,
        setNewTitle
    } = useChatStore();

    // Obtener el chatId actual de la URL y el navigate para redireccionar
    const { chatId } = useParams();
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    // Mutation para renombrar un chat
    const renameMutation = useMutation({
        mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
            const response = await fetch(`${backendEndpoints.BASE_CHAT_ENDPOINTS}/rename-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    chatId,
                    title,
                    userEmail
                })
            });

            if (!response.ok) {
                throw new Error('Failed to rename chat');
            }

            return await response.json();
        },
        onSuccess: () => {
            // Invalidar la caché para recargar los chats
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
            setIsRenameModalOpen(false);

            // Disparar evento personalizado para actualizar el sidebar
            window.dispatchEvent(new CustomEvent('chat-updated'));
        }
    });

    // Mutation para eliminar un chat
    const deleteMutation = useMutation({
        mutationFn: async (chatIdToDelete: string) => {
            if (!chatIdToDelete) {
                throw new Error('No chat ID provided for deletion');
            }

            console.log(`Starting deletion of chat with ID: ${chatIdToDelete}`);

            // Asegurarnos de que selectedChat.chatId coincide con chatIdToDelete
            if (selectedChat && selectedChat.chatId !== chatIdToDelete) {
                console.warn(`Mismatch between selectedChat.chatId (${selectedChat.chatId}) and chatIdToDelete (${chatIdToDelete})`);
                // En este caso, actualizamos selectedChat para que coincida con el chat que realmente vamos a eliminar
                // Esto evita que se elimine un chat diferente al seleccionado en el modal
                const sessions = await queryClient.getQueryData<unknown>(['userChats']);
                if (sessions) {
                    // Buscar el chat a eliminar en todas las secciones
                    const allChats = [...(sessions.today || []), ...(sessions.yesterday || []), ...(sessions.lastMonth || [])];
                    const chatToDelete = allChats.find(c => c.chatId === chatIdToDelete);
                    if (chatToDelete) {
                        console.log(`Found correct chat to delete: ${chatToDelete.title || 'No title'}`);
                        setSelectedChat(convertApiToLocalSession(chatToDelete) as ChatSession | null);
                    } else {
                        console.error(`Could not find chat with ID ${chatIdToDelete} in cache`);
                    }
                }
            }

            // Seguir con la eliminación
            const response = await fetch(`${backendEndpoints.BASE_CHAT_ENDPOINTS}/${chatIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete chat: ${response.status} ${response.statusText}`);
            }

            console.log(`API deletion of chat ${chatIdToDelete} successful`);
            return { deletedChatId: chatIdToDelete };
        },
        onSuccess: data => {
            // Usamos la respuesta para obtener el ID del chat eliminado
            const deletedChatId = data.deletedChatId;

            console.log(`Successfully deleted chat with ID: ${deletedChatId}`);

            // Si estamos eliminando el chat pinned, limpiarlo
            if (pinnedChatId === deletedChatId) {
                console.log(`Unpinning chat ${deletedChatId} because it was deleted`);
                setPinnedChatId(null);
            }

            // Si estamos eliminando el chat actual, redirigir a la ruta de nuevo chat
            if (chatId === deletedChatId) {
                console.log('Navigating to new chat because current chat was deleted');
                navigate(routes.chat.name);
            }

            // Limpiar estados - hacerlo después de verificar pinnedChatId y chatId
            setSelectedChat(null);
            setIsDeleteModalOpen(false);

            // Invalidar la caché para recargar los chats usando el ID correcto
            console.log('Invalidating userChats query cache to refresh sidebar');
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            queryClient.invalidateQueries({ queryKey: ['chat', deletedChatId] });

            // Disparar evento personalizado para actualizar el sidebar
            window.dispatchEvent(new CustomEvent('chat-updated'));
        },
        onError: error => {
            console.error('Error deleting chat:', error);
            // No cerramos el modal en caso de error para que el usuario pueda intentarlo de nuevo

            // Notificar al usuario (esto podría mejorarse con un sistema de notificaciones)
            alert(`Error al eliminar el chat: ${error.message}`);
        }
    });

    // Función para marcar/desmarcar un chat como favorito
    const togglePinChat = (chatId: string) => {
        // Validación más estricta del ID
        if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
            console.error('Invalid chat ID provided for pinning/unpinning:', chatId);
            return;
        }

        try {
            // Normalizar IDs para comparación consistente
            const normalizedChatId = chatId.trim();
            const normalizedPinnedId = (pinnedChatId || '').trim();

            console.log(`Toggle pin for chat: ${normalizedChatId} (current pinned: ${normalizedPinnedId || 'none'})`);

            // Determinar si estamos anclando o desanclando
            if (normalizedPinnedId === normalizedChatId) {
                console.log(`Unpinning chat: ${normalizedChatId}`);
                setPinnedChatId(null);
            } else {
                console.log(`Pinning chat: ${normalizedChatId} (previous pinned: ${normalizedPinnedId || 'none'})`);
                setPinnedChatId(normalizedChatId);
            }

            // Invalidar caché para forzar actualización de la lista de chats
            queryClient.invalidateQueries({ queryKey: ['userChats'] });

            // Notificar al sidebar de forma más confiable
            window.dispatchEvent(new CustomEvent('chat-updated'));

            // Log adicional para debugging
            console.log(`Pin operation complete. New pinned chat ID: ${pinnedChatId === normalizedChatId ? null : normalizedChatId}`);
        } catch (error) {
            console.error('Error toggling pin status:', error);
        }
    };

    // Función para abrir el modal de renombrar
    const openRenameModal = (chat: ApiChatSession) => {
        if (!chat || !chat.chatId) {
            console.error('Invalid chat provided for rename');
            return;
        }

        console.log(`Opening rename modal for chat: ${chat.chatId}`);
        setSelectedChat(convertApiToLocalSession(chat) as ChatSession | null);
        setNewTitle(chat.title || '');
        setIsRenameModalOpen(true);
    };

    // Función para abrir el modal de eliminar
    const openDeleteModal = (chat: ApiChatSession) => {
        if (!chat || !chat.chatId) {
            console.error('Invalid chat provided for delete');
            return;
        }

        try {
            console.log(`Opening delete modal for chat: ${chat.chatId} (${chat.title || 'No title'})`);

            // Primero, asegurarse de que la data del chat está completa
            if (!chat.messages) {
                console.warn(`Chat ${chat.chatId} might have incomplete data`);
                // Podríamos querer obtener más detalles del chat aquí si es necesario
            }

            // Convertir y establecer como seleccionado
            const convertedChat = convertApiToLocalSession(chat);
            setSelectedChat(convertedChat as ChatSession | null);
            console.log(`Selected chat set to: ${convertedChat?.chatId}`);

            // Abrir el modal
            setIsDeleteModalOpen(true);
        } catch (error) {
            console.error('Error opening delete modal:', error);
        }
    };

    // Función para descargar el chat
    const downloadChat = async (chat: ApiChatSession) => {
        if (!chat || !chat.chatId) {
            console.error('Invalid chat provided for download');
            return;
        }

        try {
            console.log(`Downloading chat: ${chat.chatId}`);
            const response = await fetch(`${backendEndpoints.BASE_CHAT_ENDPOINTS}/download/${chat.chatId}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download chat');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_${chat.chatId}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading chat:', error);
        }
    };

    return {
        renameMutation,
        deleteMutation,
        togglePinChat,
        openRenameModal,
        openDeleteModal,
        downloadChat,
        isRenameModalOpen,
        isDeleteModalOpen,
        selectedChat,
        newTitle,
        setNewTitle,
        setIsRenameModalOpen,
        setIsDeleteModalOpen
    };
}
