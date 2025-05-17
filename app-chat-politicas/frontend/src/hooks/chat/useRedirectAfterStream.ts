import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useSafeNavigation } from './useSafeNavigation';

import routes from '@/constants/routes';
import { CustomUIMessage } from '@/types/message';

/**
 * Hook para manejar la lógica de redirección después de completar o detener un stream
 * @param isNewChatRoute Indicador de si estamos en la ruta de nuevo chat
 * @param isStreamComplete Indicador de si el stream se ha completado
 * @param messages Mensajes actuales del chat
 * @param newChatIdRef Referencia al ID del nuevo chat
 */
export function useRedirectAfterStream(
    isNewChatRoute: boolean,
    isStreamComplete: boolean,
    messages: CustomUIMessage[],
    newChatIdRef: React.RefObject<string>
) {
    const location = useLocation();
    const { safeNavigate, hasRecentlyRedirected } = useSafeNavigation();
    const queryClient = useQueryClient();

    // Efecto para verificar la redirección después de completar o detener el stream
    useEffect(() => {
        if (isStreamComplete && messages.length > 0 && isNewChatRoute && location.pathname === routes.chat.name) {
            setTimeout(() => {
                if (location.pathname === routes.chat.name && newChatIdRef.current) {
                    const conversationUrl = routes.loadChat.create(newChatIdRef.current);

                    if (conversationUrl.includes(routes.loadChat.path) && !hasRecentlyRedirected()) {
                        safeNavigate(conversationUrl, {
                            replace: true,
                            state: { silent: true, forceRefresh: true }
                        });

                        setTimeout(() => {
                            queryClient.invalidateQueries({ queryKey: ['userChats'] });
                            window.dispatchEvent(new CustomEvent('chat-updated'));
                        }, 300);
                    }
                }
            }, 500);
        }
    }, [
        isStreamComplete,
        messages.length,
        isNewChatRoute,
        location.pathname,
        safeNavigate,
        queryClient,
        hasRecentlyRedirected,
        newChatIdRef
    ]);
}
