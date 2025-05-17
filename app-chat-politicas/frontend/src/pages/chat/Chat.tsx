import { useQueryClient } from '@tanstack/react-query';
import { ArrowUp, CirclePause, FileText } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import AgentPopover from './components/AgentsPopover/AgentPopOver';
import { PreviewMessage } from './components/Message';
import { MessageLimitModal } from './components/Modals/MessageLimitModal';

import ChatLoaderScreen from '@/components/Chat/ChatLoaderScreen';
import { Textarea } from '@/components/ui/textarea';
import routes from '@/constants/routes';
import { useChatHistory, useRedirectAfterStream, useSafeNavigation, useStreamChat } from '@/hooks/chat';
import { useAppStore } from '@/store/app';
import { generateChatId, useChatStore } from '@/store/chat/chat.store';
import { backendEndpoints } from '@/constants/backend-routes';

// Límite máximo de mensajes por chat
const MAX_MESSAGES_PER_CHAT = 20;

// Datos de preguntas de ejemplo para el chat vacío
const EXAMPLE_QUESTIONS = [
    {
        title: 'Política de viernes flex',
        question: '¿Cuál es el horario de término de la jornada según la política de viernes flex?'
    },
    {
        title: 'Política de estudios de inglés en el extranjero',
        question: '¿Cómo puedo saber si califico para el financiamiento del curso de inglés en el extranjero?'
    },
    {
        title: 'Política protección de datos',
        question: '¿Cómo puedo obtener más información sobre las prácticas de protección de datos de PwC?'
    },
    {
        title: 'Política rendiciones de gastos, traslados y viáticos',
        question: '¿Cuáles son los pasos básicos para rendir un gasto?'
    },
    {
        title: 'Política de sala cuna',
        question: '¿Qué debo hacer para inscribir a mi hijo en una sala cuna o jardín infantil bajo esta política?'
    },
    {
        title: 'Política de global mobility',
        question: '¿Cuáles son los requisitos específicos para ser elegible y participar en el programa Global Mobility?'
    }
];

export default function Chat() {
    const { chatId } = useParams();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Determinar si estamos en la ruta de nuevo chat - usando useMemo para evitar recálculos
    const isNewChatRoute = useMemo(() => location.pathname === routes.chat.name, [location.pathname]);

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMessageLimitModalOpen, setIsMessageLimitModalOpen] = useState(false);
    const [isStreamComplete, setIsStreamComplete] = useState(true);

    // Referencia al formulario para poder disparar su envío programáticamente
    const formRef = useRef<HTMLFormElement>(null);

    // Si estamos en la ruta de nuevo chat, generar un ID - utilizando useMemo para estabilidad
    const newChatIdRef = useRef(useRef<string>(isNewChatRoute ? generateChatId() : '').current);

    // Hooks personalizados para extraer lógica
    const { safeNavigate } = useSafeNavigation();
    const { isLoadingHistory } = useChatHistory(chatId, isNewChatRoute);

    // Usar el store de chat con una extracción selectiva para evitar re-renders innecesarios
    const {
        messages,
        addMessage,
        updateMessage,
        setIsLoading,
        isLoading: storeIsLoading,
        createUserMessage,
        clearMessages
    } = useChatStore();

    // Verificar si se ha alcanzado el límite de mensajes
    const hasReachedMessageLimit = messages.length >= MAX_MESSAGES_PER_CHAT;

    // Usar el store de la aplicación
    const { selectedAgent, setSelectedAgent, selectedChatId, setSelectedChatId, userEmail } = useAppStore();

    // Cuando entramos en la ruta de nuevo chat, limpiar mensajes y generar nuevo ID
    useEffect(() => {
        if (isNewChatRoute) {
            console.log('Entering new chat route, cleaning up previous states');
            // Limpiar mensajes anteriores
            clearMessages();

            // Generar un nuevo ID de chat sin reutilizar IDs anteriores
            const newId = generateChatId();
            newChatIdRef.current = newId;
            console.log(`Generated new chat ID: ${newId}`);

            // Actualizar el ID de chat seleccionado
            setSelectedChatId(newId);

            // Asegurarse de que el ID no pueda colisionar con un chat anclado
            const currentPinnedChatId = useAppStore.getState().pinnedChatId;
            console.log(`Current pinned chat ID: ${currentPinnedChatId || 'none'}`);

            // Verificar que el estado global se ha actualizado correctamente
            console.log(`Selected chat ID after update: ${useAppStore.getState().selectedChatId}`);

            // Notificar al resto de la aplicación sobre el cambio
            window.dispatchEvent(new CustomEvent('chat-updated'));
        }
    }, [isNewChatRoute, clearMessages, setSelectedChatId]);

    // Establecer el agente por defecto
    useEffect(() => {
        if (!selectedAgent) {
            setSelectedAgent({
                id: 'internal-documents-toolkit',
                name: 'Políticas/Beneficio',
                color: '#299D8F'
            });
        }
    }, [selectedAgent, setSelectedAgent]);

    // Actualizar el chat ID seleccionado cuando cambia el parámetro de la URL
    useEffect(() => {
        // Si estamos en una navegación silenciosa, no actualizar el chatId
        if (location.state && (location.state as unknown).silent === true) {
            return;
        }

        if (chatId && !isNewChatRoute) {
            setSelectedChatId(chatId);
        } else if (isNewChatRoute && newChatIdRef.current) {
            setSelectedChatId(newChatIdRef.current);
        }
    }, [chatId, setSelectedChatId, isNewChatRoute, location.state]);

    // Usar el hook para redirección post-stream
    useRedirectAfterStream(isNewChatRoute, isStreamComplete, messages, newChatIdRef);

    // Usar el hook personalizado para el streaming
    const {
        streamChat,
        stopStream,
        isLoading: streamIsLoading
    } = useStreamChat({
        apiUrl: `${backendEndpoints.BASE_CHAT_ENDPOINTS}/`,
        chatId: selectedChatId || (isNewChatRoute ? newChatIdRef.current : chatId) || '',
        onMessageStart: message => {
            setIsStreamComplete(false);
            addMessage(message);
            setTimeout(() => scrollToBottom(), 100);
        },
        onMessageUpdate: message => {
            updateMessage(message.id, message);
            scrollToBottom();
        },
        onMessageComplete: message => {
            updateMessage(message.id, message);
            setIsLoading(false);
            setIsStreamComplete(true);
            setTimeout(() => scrollToBottom(), 100);

            // Si estamos en la ruta de nuevo chat y el mensaje se completó correctamente,
            // Realizar la navegación forzada y actualizar el sidebar
            if (isNewChatRoute && newChatIdRef.current && location.pathname === routes.chat.name) {
                // Refrescar las listas de chats
                queryClient.invalidateQueries({ queryKey: ['userChats'] });

                setTimeout(() => {
                    // Obtener la URL de la conversación
                    const conversationUrl = routes.loadChat.create(newChatIdRef.current);

                    // Verificar que no estamos redirigiendo a new de nuevo
                    if (conversationUrl.includes(routes.loadChat.path)) {
                        safeNavigate(conversationUrl, {
                            replace: true,
                            state: { silent: true, forceRefresh: true }
                        });

                        // Forzar una recarga de los chats del usuario después de la navegación
                        setTimeout(() => {
                            queryClient.invalidateQueries({ queryKey: ['userChats'] });
                            window.dispatchEvent(new CustomEvent('chat-updated'));
                        }, 300);
                    }
                }, 100);
            }
        },
        onError: _ => {
            setIsLoading(false);
            setIsStreamComplete(true);
        },
        getMessages: () => messages
    });

    // Manejar el cambio en el input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || storeIsLoading) {
            return;
        }

        // Verificar si se ha alcanzado el límite de mensajes
        if (hasReachedMessageLimit) {
            setIsMessageLimitModalOpen(true);
            return;
        }

        // Crear mensaje del usuario
        const userMessage = createUserMessage(input);

        // Si hay un agente seleccionado, agregar la información del agente al mensaje
        if (selectedAgent) {
            userMessage.agentInfo = {
                id: selectedAgent.id,
                name: selectedAgent.name,
                color: selectedAgent.color
            };
        }

        // Add the user message to the local state immediately
        addMessage(userMessage);
        setInput('');
        setIsLoading(true);

        // Get the current message history
        const currentMessages = useChatStore.getState().messages;
        console.log(`Current message count: ${currentMessages.length}`);

        try {
            // Caso especial: si estamos en la ruta de nuevo chat
            if (isNewChatRoute) {
                // Validación extra del ID de chat
                if (!newChatIdRef.current) {
                    console.warn('New chat ID is not set, generating one now');
                    newChatIdRef.current = generateChatId();
                }

                const chatIdToUse = newChatIdRef.current;
                console.log(`Streaming new chat with ID: ${chatIdToUse}`);

                // Asegurarnos que el ID del chat seleccionado está configurado
                setSelectedChatId(chatIdToUse);
                console.log(`Selected chat ID set to: ${chatIdToUse}`);

                // Para nuevos chats, solo transmitimos el nuevo mensaje del usuario
                await streamChat([userMessage]);

                // Notificar al sidebar que se ha creado un nuevo chat
                queryClient.invalidateQueries({ queryKey: ['userChats', userEmail] });
                window.dispatchEvent(new CustomEvent('chat-updated'));

                console.log('New chat created and notified to sidebar');
            } else {
                // Caso normal: estamos en una conversación existente
                // Make sure we have the most up-to-date message history including the new user message
                const updatedMessageHistory = [...currentMessages];
                const currentChatId = chatId || selectedChatId;
                console.log(`Streaming chat with ${updatedMessageHistory.length} messages in chat ID: ${currentChatId}`);

                await streamChat(updatedMessageHistory);

                // Si es el primer mensaje del chat, refrescar la lista de chats recientes
                if (currentMessages.length <= 1) {
                    console.log('First message in chat, refreshing recent chats');
                    queryClient.invalidateQueries({ queryKey: ['userChats', userEmail] });
                    window.dispatchEvent(new CustomEvent('chat-updated'));
                }
            }
        } catch (error) {
            console.error('Error during chat submission:', error);
            setIsLoading(false);
        }
    };

    // Función para manejar el clic en una pregunta de ejemplo
    const handleQuestionClick = (question: string) => {
        if (storeIsLoading || hasReachedMessageLimit) {
            return;
        }

        setInput(question);

        // Usar setTimeout para asegurar que el estado de input se actualice antes de enviar
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }, 100);
    };

    const stop = useCallback(() => {
        // Call stopStream first to save the messages with the stop indicator
        stopStream();
        setIsLoading(false);
        setIsStreamComplete(true);

        // Si estamos en la ruta de nuevo chat y se ha detenido el stream,
        // necesitamos forzar la navegación y actualizar el sidebar
        if (isNewChatRoute && newChatIdRef.current && location.pathname === routes.chat.name) {
            // Refrescar TODAS las listas de chats
            queryClient.invalidateQueries({ queryKey: ['userChats'] });

            // Asegurar que se notifique de la actualización del chat siempre
            window.dispatchEvent(new CustomEvent('chat-updated'));

            setTimeout(() => {
                const conversationUrl = routes.loadChat.create(newChatIdRef.current);

                if (conversationUrl.includes(routes.loadChat.path)) {
                    safeNavigate(conversationUrl, {
                        replace: true,
                        state: { silent: true, forceRefresh: true }
                    });

                    setTimeout(() => {
                        // Doble verificación para asegurar que la UI se actualice
                        queryClient.invalidateQueries({ queryKey: ['userChats'] });
                        window.dispatchEvent(new CustomEvent('chat-updated'));
                    }, 300);
                }
            }, 100);
        }
    }, [stopStream, location.pathname, isNewChatRoute, queryClient, safeNavigate, newChatIdRef]);

    // Desplazarse al final de los mensajes
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: streamIsLoading ? 'auto' : 'smooth',
                block: 'end'
            });
        }
    };

    // Efecto para desplazarse al final cuando cambian los mensajes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [messages]);

    // Monitorear cambios en streamIsLoading
    useEffect(() => {
        if (!streamIsLoading && storeIsLoading) {
            setIsLoading(false);
        }
    }, [streamIsLoading, storeIsLoading, setIsLoading]);

    return (
        <main className='w-full flex justify-center relative z-10 !p-0 !m-0'>
            {isLoadingHistory && <ChatLoaderScreen />}

            {/* Modal de límite de mensajes */}
            <MessageLimitModal isOpen={isMessageLimitModalOpen} onClose={() => setIsMessageLimitModalOpen(false)} />

            {!isLoadingHistory && (
                <section className='w-full flex flex-col mx-4'>
                    <div className={`flex-1 overflow-y-scroll p-4 space-y-10 md:pt-4 ${messages.length === 0 ? 'pt-40' : ''}`}>
                        {messages.length === 0 ? (
                            <div className='relative grid grid-cols-1 items-center justify-center h-full justify-items-center'>
                                <div className='z-[2] text-center text-text_globe'>
                                    <h3 className='text-xl font-medium'>Bienvenido al Chat IA PwC Chile</h3>
                                    <p className='mt-2'>Escribe un mensaje para comenzar la conversación</p>

                                    <section className='grid grid-cols-2 gap-5 mt-3 text-xs'>
                                        {EXAMPLE_QUESTIONS.map((item, index) => (
                                            <div
                                                key={index}
                                                className='bg-background hover:bg-container_prompt_area grid gap-3 p-4 shadow-lg rounded-lg max-w-[20rem] text-left cursor-pointer transition-colors'
                                                onClick={() => handleQuestionClick(item.question)}
                                                aria-label={`Hacer esta pregunta: ${item.question}`}
                                                role='button'
                                                tabIndex={0}
                                            >
                                                <div className='flex items-center gap-2 text-foreground/50'>
                                                    <FileText size={16} /> {item.title}
                                                </div>
                                                <div>{item.question}</div>
                                            </div>
                                        ))}
                                    </section>
                                </div>
                                {/* <div className='absolute top-50 opacity-35'>
                                    <Globe />
                                </div> */}
                            </div>
                        ) : (
                            <>
                                {messages.map(message => (
                                    <PreviewMessage key={message.id} message={message} chatId={chatId} />
                                ))}
                            </>
                        )}
                        <div ref={messagesEndRef} />

                        {messages.length >= MAX_MESSAGES_PER_CHAT && (
                            <section className='text-center bg-destructive py-3 text-white font-bold'>
                                Has alcanzado el limite máximo de mensajes en este chat
                            </section>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className='flex justify-center mb-[1.3rem]' ref={formRef}>
                        <div className='grid items-center gap-2 max-w-2xl justify-center w-full justify-items-center'>
                            {/* PROMPT AREA */}
                            <section
                                className={`relative w-full bg-container_prompt_area rounded-lg px-2 mx-4 ${selectedAgent && '!rounded-tl-none'} transition-all duration-300 z-[50]`}
                                style={{
                                    borderWidth: selectedAgent ? '2px' : '1px',
                                    borderStyle: 'solid',
                                    borderColor: selectedAgent?.color || 'transparent',
                                    transition: 'border-color 0.3s ease'
                                }}
                            >
                                {/* Agent Label */}
                                {selectedAgent && (
                                    <div
                                        className='absolute -top-8 -left-[0.14rem] px-4 py-2 rounded-md text-xs font-medium z-10 rounded-b-none flex items-center min-w-[14rem] justify-between'
                                        style={{
                                            backgroundColor: selectedAgent.color,
                                            color: '#FFFFFF',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <p>{selectedAgent.name}</p>
                                    </div>
                                )}

                                <Textarea
                                    placeholder={
                                        hasReachedMessageLimit
                                            ? 'Has alcanzado el límite de mensajes en este chat'
                                            : 'Escribe tu consulta...'
                                    }
                                    className='min-h-[60px] resize-none rounded-xl bg-container_prompt_area text-xs border-border_prompt_area border w-full pt-4 '
                                    maxLength={400}
                                    minLength={10}
                                    // @ts-expect-error
                                    onChange={handleInputChange}
                                    defaultValue={input || ''}
                                    value={input}
                                    disabled={storeIsLoading || hasReachedMessageLimit}
                                />

                                {/* AGENTES */}
                                <section className='flex w-full justify-between rounded-full text-xs'>
                                    <span className='h-10'>
                                        <AgentPopover />
                                    </span>
                                    <section className='flex items-center gap-2'>
                                        <span className='mr-6 text-[.6rem] mt-2 select-none'>
                                            {storeIsLoading ? 0 : input?.length || 0} / 400
                                        </span>
                                        {!storeIsLoading && (
                                            <button
                                                className='rounded-lg !max-w-10 !min-w-10 p-0 m-0 h-8 w-8 flex items-center justify-center'
                                                style={{
                                                    backgroundColor: selectedAgent ? selectedAgent.color : 'var(--color-text-primary)',
                                                    cursor:
                                                        storeIsLoading || !input.trim() || hasReachedMessageLimit
                                                            ? 'not-allowed'
                                                            : 'pointer',
                                                    opacity: storeIsLoading || !input.trim() || hasReachedMessageLimit ? 0.5 : 1
                                                }}
                                                type='submit'
                                                disabled={storeIsLoading || !input.trim() || hasReachedMessageLimit}
                                            >
                                                <ArrowUp className='text-white' size={16} />
                                            </button>
                                        )}
                                        {storeIsLoading && (
                                            <button
                                                onClick={stop}
                                                className='rounded-lg !max-w-10 !min-w-10 p-0 m-0 h-8 w-8 flex items-center justify-center bg-black'
                                            >
                                                <CirclePause className='text-white' size={18} />
                                            </button>
                                        )}
                                    </section>
                                </section>
                                {/* FIN AGENTES */}
                            </section>

                            {/* FIN PROMPT AREA */}

                            <div className='text-center text-[0.6rem] pt-2 bg-white-default w-full'>
                                Al enviar un mensaje por esta herramienta, aceptas nuestros <span className='font-semibold'>Términos</span>{' '}
                                y reconoces que leíste nuestra <span className='font-semibold'>Política de privacidad</span>
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </main>
    );
}
