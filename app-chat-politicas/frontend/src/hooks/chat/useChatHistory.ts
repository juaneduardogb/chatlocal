import { message } from 'antd';
import { useState, useEffect } from 'react';

import { useSafeNavigation } from './useSafeNavigation';

import routes from '@/constants/routes';
import { useAppStore } from '@/store/app';
import { useChatStore } from '@/store/chat/chat.store';
import { backendEndpoints } from '@/constants/backend-routes';

/**
 * Hook personalizado para manejar la lógica de carga de historial de chat
 * @param chatId ID del chat a cargar
 * @param isNewChatRoute Indicador de si estamos en la ruta de nuevo chat
 * @returns Estado de carga del historial de chat
 */
export function useChatHistory(chatId: string | undefined, isNewChatRoute: boolean) {
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const { safeNavigate, hasRecentlyRedirected } = useSafeNavigation();
    const { setMessages, setIsLoading, clearMessages } = useChatStore();
    const { token } = useAppStore();

    // Este efecto se ejecuta cuando cambia isNewChatRoute para asegurar que se limpien los mensajes
    useEffect(() => {
        if (isNewChatRoute) {
            clearMessages();
        }
    }, [isNewChatRoute, clearMessages]);

    useEffect(() => {
        const loadChatHistory = async () => {
            // Si hubo una redirección reciente y estamos en una ruta de conversación
            if (hasRecentlyRedirected() && location.pathname.includes(routes.loadChat.path)) {
                setIsLoadingHistory(false);
                return;
            }

            // Caso de nuevo chat
            if (isNewChatRoute) {
                setMessages([]);
                setIsLoadingHistory(false);
                return;
            }

            // Caso de chat existente
            if (chatId && chatId !== 'new' && chatId.length > 5) {
                try {
                    setIsLoading(true);
                    const apiUrl = `${backendEndpoints.BASE_CHAT_ENDPOINTS}/${chatId}`;
                    const response = await fetch(apiUrl, {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : ''
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Error al cargar el chat: ${response.statusText}`);
                    }

                    const data = await response.json();
                    const messages = data.messages || (data.chatSession && data.chatSession.messages) || [];

                    if (messages && messages.length > 0) {
                        const formattedMessages = messages.map((message: unknown) => ({
                            ...message,
                            events:
                                message.events?.map((event: unknown) => ({
                                    ...event,
                                    timestamp: new Date(event.timestamp)
                                })) || [],
                            rating: message.rating || null
                        }));

                        setMessages(formattedMessages);
                        setIsLoadingHistory(false);
                    } else {
                        console.warn('El chat existe pero no tiene mensajes');
                        message.warning('Este chat no tiene mensajes');
                        // Si el chat no tiene mensajes, redirigir a nuevo chat
                        safeNavigate(routes.chat.name);
                    }
                } catch (error) {
                    console.error('Error al cargar el historial del chat:', error);
                    safeNavigate(routes.chat.name);
                } finally {
                    setIsLoading(false);
                    setIsLoadingHistory(false);
                }
            } else {
                // ChatId no válido
                if (location.pathname.includes(routes.loadChat.path) && (!chatId || chatId.length <= 5)) {
                    if (!hasRecentlyRedirected()) {
                        safeNavigate(routes.chat.name, { replace: true });
                    }
                    return;
                }

                setMessages([]);
                setIsLoadingHistory(false);
            }
        };

        loadChatHistory();

        // Limpiar los mensajes al desmontar el componente
        return () => {
            clearMessages();
        };
    }, [chatId, isNewChatRoute, token, setMessages, setIsLoading, safeNavigate, hasRecentlyRedirected, clearMessages]);

    return { isLoadingHistory };
}
