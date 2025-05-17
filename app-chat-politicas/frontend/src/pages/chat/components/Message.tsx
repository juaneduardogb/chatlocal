import { Tooltip } from '@heroui/react';
import { cn } from '@heroui/theme';
import { message as messageAntd } from 'antd';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import { Copy, SparklesIcon, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { memo, useState, useCallback } from 'react';

import { ThinkingTimeline } from '@/components/Chat/ThinkingTimeline';
import { useStreamChat } from '@/hooks/chat/useStreamChat';
import { Markdown } from '@/pages/chat/components/PromptArea/Markdown';
import { useAppStore } from '@/store/app';
import { useChatStore } from '@/store/chat/chat.store';
import { CustomUIMessage, MessageRating } from '@/types/message';
import { backendEndpoints } from '@/constants/backend-routes';

export const PreviewMessage = memo(({ message, chatId }: { chatId?: string; message: CustomUIMessage }) => {
    const { isLoading } = useChatStore();
    const { userPhoto, selectedChatId: storeChatId } = useAppStore();
    const { updateMessageRating } = useChatStore();

    // Estado local para manejar la animación de los botones de rating
    const [isRatingChanging, setIsRatingChanging] = useState(false);

    // Obtener el chatId de los props o del store
    const currentChatId = chatId || storeChatId;

    // Usar el hook de streaming para guardar la calificación
    const { saveMessageRating } = useStreamChat({
        apiUrl: backendEndpoints.BASE_CHAT_ENDPOINTS,
        chatId: currentChatId || ''
    });

    // Función debounce para prevenir múltiples clics rápidos
    const debouncedUpdateRating = useCallback(
        debounce((messageId: string, rating: MessageRating) => {
            // Actualizar estado local
            updateMessageRating(messageId, rating);

            // Guardar en el servidor
            if (currentChatId) {
                saveMessageRating(messageId, rating).catch(error => {
                    console.error('Error al guardar la calificación:', error);
                    messageAntd.error('No se pudo guardar la calificación');
                });
            }

            setIsRatingChanging(false);
        }, 500),
        [updateMessageRating, saveMessageRating, currentChatId]
    );

    // Manejador para cambiar la puntuación
    const handleRatingChange = useCallback(
        (rating: MessageRating) => {
            // Si ya está en proceso de cambio, no hacer nada
            if (isRatingChanging) {
                return;
            }

            // Si el rating es el mismo que ya tiene, lo quitamos (toggle)
            const newRating = message.rating === rating ? null : rating;

            // Activar estado de cambio para mostrar animación/prevenir spam
            setIsRatingChanging(true);

            // Actualizar el rating con debounce
            debouncedUpdateRating(message.id, newRating);
        },
        [message.id, message.rating, debouncedUpdateRating, isRatingChanging]
    );

    return (
        <motion.div
            className='w-full mx-auto max-w-4xl md:px-4 group/message'
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5 }}
            data-role={message.role}
            data-message-id={message.id}
            data-message-role={message.role}
        >
            <section className='flex gap-2'>
                <div
                    className={cn(
                        'group-data-[role=user]/message:bg-container_menu group-data-[role=user]/message:text-menu_items flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl transition-size duration-300 ease-in-out'
                    )}
                >
                    {message.role === 'assistant' && (
                        <div className='size-8 items-center rounded-full justify-center hidden md:flex'>
                            <SparklesIcon size={14} />
                        </div>
                    )}

                    <div className='p-4 flex flex-col gap-2 w-full group-data-[role=assistant]/message:bg-bg_assistant_message rounded-lg md:group-data-[role=assistant]/message:p-4'>
                        {message.role === 'assistant' && (
                            <ThinkingTimeline
                                events={message.events || []}
                                isThinking={!message.content && isLoading}
                                completed={!!message.content}
                            />
                        )}

                        {message.content && (
                            <div className='' data-message-content>
                                <Markdown>{message.content as string}</Markdown>
                                {message.role === 'assistant' && (
                                    <div className='text-[0.6rem] max-w-[18rem] text-wrap bg-bg_assistant_disclaimer rounded-sm px-2 py-1  mt-5 text-foreground'>
                                        Contenido generado por IA, puede contener errores.
                                    </div>
                                )}
                            </div>
                        )}

                        {message.toolInvocations && message.toolInvocations.length > 0 && (
                            <div className='flex flex-col gap-4 mt-4'>
                                {message.toolInvocations.map(toolInvocation => {
                                    const { toolName, toolCallId, state } = toolInvocation;

                                    if (state === 'result') {
                                        // Renderizar resultados específicos según el tipo de herramienta
                                        if (toolName === 'internal_document_event') {
                                            // Obtener el resultado específicamente como lo envía el backend
                                            const docResults = toolInvocation.result as Array<{
                                                document_url: string;
                                                document_name: string;
                                            }>;

                                            return (
                                                <div key={toolCallId} className=''>
                                                    <h4 className='text-xs font-semibold mb-2'>Fuentes</h4>
                                                    {Array.isArray(docResults) && docResults.length > 0 ? (
                                                        <ul className='flex gap-4 flex-wrap text-xs'>
                                                            {docResults.map((doc, index) => (
                                                                <li key={index} className='mb-1'>
                                                                    <a
                                                                        href={doc.document_url}
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        className='bg-container_menu p-2 hover:underline text-xs text-foreground overflow-hidden whitespace-nowrap text-ellipsis inline-block md:max-w-[200px] w-full'
                                                                    >
                                                                        <span className='text-xs bg-background text-foreground mr-2 p-1 rounded-full'>
                                                                            {index + 1}
                                                                        </span>
                                                                        {doc.document_name || 'Documento sin título'}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                            No se encontraron fuentes.
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                    }
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* IMAGE USER */}
                {userPhoto && message.role === 'user' && (
                    <div className='size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border'>
                        <img src={userPhoto} alt='User' className='w-full h-full object-cover rounded-full' />
                    </div>
                )}
            </section>

            {/* SECOND ACTIONS */}
            <section className='flex group-data-[role=user]/message:justify-end w-auto mt-3 md:group-data-[role=assistant]/message:ml-14 gap-x-2 '>
                <Tooltip content='Copiar mensaje'>
                    <span
                        className='p-2 hover:bg-container_prompt_area rounded-full cursor-pointer'
                        onClick={() => {
                            if (message.content) {
                                navigator.clipboard.writeText(message.content);
                                messageAntd.success('Se ha copiado correctamente el mensaje.');
                            }
                        }}
                    >
                        <Copy size={12} className='text-foreground' />
                    </span>
                </Tooltip>
                {message.role === 'assistant' && (
                    <>
                        <Tooltip content='Respuesta adecuada'>
                            <span
                                className={cn('p-2 rounded-full cursor-pointer transition-all duration-200', {
                                    'hover:bg-container_prompt_area': message.rating !== 'positive',
                                    'opacity-50 pointer-events-none': isRatingChanging
                                })}
                                onClick={() => handleRatingChange('positive')}
                            >
                                <ThumbsUp
                                    size={12}
                                    className={message.rating === 'positive' ? 'text-primary font-semibold' : 'text-foreground'}
                                    strokeWidth={cn({
                                        3: message.rating === 'positive',
                                        2.1: message.rating === 'negative',
                                        2: message.rating === undefined || message.rating === null
                                    })}
                                />
                            </span>
                        </Tooltip>
                        <Tooltip content='Respuesta no adecuada'>
                            <span
                                className={cn('p-2 rounded-full cursor-pointer transition-all duration-200', {
                                    'hover:bg-container_prompt_area': message.rating !== 'negative',
                                    'opacity-50 pointer-events-none': isRatingChanging
                                })}
                                onClick={() => handleRatingChange('negative')}
                            >
                                <ThumbsDown
                                    size={12}
                                    className={message.rating === 'negative' ? 'text-primary font-semibold' : 'text-foreground'}
                                    strokeWidth={cn({
                                        3: message.rating === 'negative',
                                        2.1: message.rating === 'positive',
                                        2: message.rating === undefined || message.rating === null
                                    })}
                                />
                            </span>
                        </Tooltip>
                    </>
                )}
            </section>
        </motion.div>
    );
});
