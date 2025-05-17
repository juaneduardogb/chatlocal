import { useState, useCallback, useRef } from 'react';

import { useAppStore } from '@/store/app';
import { generateId } from '@/store/chat/chat.store';
import { CustomToolInvocation, CustomUIMessage, MessageRating } from '@/types/message';

interface UseStreamChatOptions {
    apiUrl: string;
    chatId: string;
    onMessageStart?: (message: CustomUIMessage) => void;
    onMessageUpdate?: (message: CustomUIMessage) => void;
    onMessageComplete?: (message: CustomUIMessage) => void;
    onError?: (error: Error) => void;
    getMessages?: () => CustomUIMessage[];
}

interface EventMessage {
    id: string;
    timestamp: Date;
    type: string;
    message: string;
}

/**
 * Hook para procesar datos del stream y actualizar el mensaje del asistente
 */
function useMessageProcessor() {
    // Función auxiliar para depuración durante el desarrollo
    const logToolProcessing = (label: string, data: unknown) => {
        if (process.env.NODE_ENV === 'development') {
            console.group(`[ToolProcessor] ${label}`);
            console.log(data);
            console.groupEnd();
        }
    };

    // Procesa los datos recibidos del stream y actualiza el mensaje del asistente
    const processStreamData = (data: string, assistantMessage: CustomUIMessage): CustomUIMessage => {
        if (!data || data === '[DONE]') {
            return assistantMessage;
        }

        try {
            const isTextMessage = data.startsWith('0: ');
            const isToolExecuting = data.startsWith('b: ');
            const isEventMessage = data.startsWith('e: ');

            // Mensaje de texto: actualizar el contenido
            if (isTextMessage) {
                const newContent = (assistantMessage.content || '') + data.slice(3);
                return {
                    ...assistantMessage,
                    content: newContent,
                    events: [...(assistantMessage.events || [])]
                };
            }

            // Llamada a herramienta o resultado de herramienta
            if (isToolExecuting) {
                try {
                    // Analizar los datos JSON de la herramienta
                    const rawData = data.slice(3);
                    logToolProcessing('Datos recibidos', rawData);

                    const parsedData = JSON.parse(rawData);
                    logToolProcessing('Datos parseados', parsedData);

                    // Determinar si es un array o un objeto único
                    const toolsData = Array.isArray(parsedData) ? parsedData : [parsedData];

                    // Extraer información de la herramienta
                    const toolInvocations: CustomToolInvocation[] = toolsData.map((toolData: unknown) => {
                        const isResult = toolData.state === 'result';

                        const toolInvocation = {
                            toolCallId: toolData.toolCallId,
                            toolName: toolData.toolName,
                            toolArgs: toolData.toolArgs || {},
                            state: toolData.state || 'calling',
                            createdAt: new Date(toolData.createdAt || new Date()),
                            result: isResult ? toolData.result : undefined
                        };

                        logToolProcessing(`Herramienta ${isResult ? 'resultado' : 'llamada'}: ${toolData.toolName}`, toolInvocation);

                        return toolInvocation;
                    });

                    // Buscar herramientas existentes y actualizar su estado
                    const existingTools = [...(assistantMessage.toolInvocations || [])];
                    const updatedTools: CustomToolInvocation[] = [];
                    const newTools: CustomToolInvocation[] = [];

                    // Procesar cada herramienta
                    toolInvocations.forEach(tool => {
                        // Buscar si ya existe una herramienta con el mismo ID
                        const existingToolIndex = existingTools.findIndex(t => t.toolCallId === tool.toolCallId);

                        if (existingToolIndex >= 0) {
                            // Actualizar herramienta existente
                            updatedTools.push({
                                ...existingTools[existingToolIndex],
                                ...tool,
                                state: tool.state || existingTools[existingToolIndex].state
                            });
                            // Eliminar de la lista de existentes
                            existingTools.splice(existingToolIndex, 1);
                        } else {
                            // Es una nueva herramienta
                            newTools.push(tool);
                        }
                    });

                    // Combinar herramientas actualizadas, nuevas y el resto de existentes
                    const finalTools = [...updatedTools, ...newTools, ...existingTools];

                    logToolProcessing('Herramientas finales', finalTools);

                    // Crear eventos para las nuevas herramientas
                    const newEvents = newTools.map(tool => ({
                        id: generateId(),
                        timestamp: new Date(),
                        type: 'tool',
                        message: `Ejecutando herramienta: ${tool.toolName || 'desconocida'}`
                    }));

                    // Crear eventos para herramientas actualizadas a estado "result"
                    const resultEvents = updatedTools
                        .filter(tool => tool.state === 'result')
                        .map(tool => ({
                            id: generateId(),
                            timestamp: new Date(),
                            type: 'tool_result',
                            message: `Resultado de herramienta: ${tool.toolName || 'desconocida'}`
                        }));

                    // Actualizar el mensaje con todas las herramientas y eventos
                    return {
                        ...assistantMessage,
                        toolInvocations: finalTools,
                        events: [...(assistantMessage.events || []), ...newEvents, ...resultEvents]
                    };
                } catch (error) {
                    console.error('Error procesando datos de herramienta:', error, data);
                    return assistantMessage;
                }
            }

            // Evento del sistema
            if (isEventMessage) {
                const parsed: EventMessage = JSON.parse(data.slice(3));
                parsed.timestamp = new Date(parsed.timestamp);

                return {
                    ...assistantMessage,
                    events: [...(assistantMessage.events || []), parsed]
                };
            }

            return assistantMessage;
        } catch (e) {
            console.error('Error procesando datos del stream:', e, data);
            // Silenciosamente fallar y devolver el mensaje sin cambios
            return assistantMessage;
        }
    };

    return { processStreamData };
}

export function useStreamChat({
    apiUrl,
    chatId,
    onMessageStart,
    onMessageUpdate,
    onMessageComplete,
    onError,
    getMessages
}: UseStreamChatOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const assistantMessageRef = useRef<CustomUIMessage | null>(null);
    const { userEmail, token } = useAppStore();
    const { processStreamData } = useMessageProcessor();

    // Function to save chat messages to the backend
    const saveChatMessages = useCallback(
        async (messages: CustomUIMessage[], chatId: string) => {
            if (!chatId || chatId.length < 5) {
                console.error('Invalid chatId provided for saving messages');
                return null;
            }

            if (!messages || messages.length === 0) {
                console.log('No messages to save, skipping save operation');
                return null;
            }

            try {
                console.log(`Saving chat ${chatId} with ${messages.length} messages`);

                // Preparamos un título apropiado
                const title = messages.length > 0 ? messages[0].content?.substring(0, 50) || 'Nuevo Chat' : 'Nuevo Chat';

                // Guardar directamente los mensajes sin verificar si el chat existe
                console.log(`Saving chat ${chatId} with ${messages.length} messages...`);
                const response = await fetch(`${apiUrl}save-chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        chatId,
                        userEmail,
                        messages: messages,
                        title
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to save chat: ${response.status}`);
                }

                console.log(`Successfully saved chat ${chatId} with ${messages.length} messages`);
                return await response.json();
            } catch (error) {
                console.error(`Error saving chat: ${error}`);
                return null;
            }
        },
        [apiUrl, userEmail, token]
    );

    // Function to save message rating
    const saveMessageRating = useCallback(
        async (messageId: string, rating: MessageRating) => {
            try {
                if (!chatId) {
                    return null;
                }

                const response = await fetch(`${apiUrl}/rate-message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        chatId,
                        messageId,
                        rating,
                        userEmail
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to save rating: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error saving message rating:', error);
                return null;
            }
        },
        [apiUrl, chatId, userEmail, token]
    );

    /**
     * Crea un mensaje inicial del asistente
     */
    const createInitialAssistantMessage = useCallback((lastMessage: CustomUIMessage | null) => {
        // Crear un mensaje inicial vacío con las partes requeridas
        const assistantMessage: CustomUIMessage = {
            id: generateId(),
            role: 'assistant',
            content: '',
            createdAt: new Date(),
            experimentalAttachments: [],
            toolInvocations: [],
            events: []
        };

        // Check if the last message has agent info
        const hasAgentInfo = lastMessage && lastMessage.agentInfo;

        // If the user message has agent info, add tool invocation for the agent
        if (hasAgentInfo && lastMessage?.agentInfo) {
            const toolCallId = generateId();
            assistantMessage.toolInvocations = [
                {
                    toolCallId,
                    toolName: lastMessage.agentInfo.name,
                    toolArgs: { agentId: lastMessage.agentInfo.id },
                    state: 'calling' as const,
                    createdAt: new Date()
                }
            ];
        }

        return assistantMessage;
    }, []);

    /**
     * Procesa las líneas recibidas del stream
     */
    const processStreamLines = useCallback(
        async (
            lines: string[],
            assistantMessage: CustomUIMessage,
            onMessageUpdate?: (message: CustomUIMessage) => void
        ): Promise<CustomUIMessage> => {
            let updatedMessage = { ...assistantMessage };

            for (const line of lines) {
                if (!line.trim()) {
                    continue;
                }

                // Procesar cada línea según el protocolo de Vercel AI SDK
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        break;
                    }

                    // Procesar los datos y actualizar el mensaje
                    updatedMessage = processStreamData(data, updatedMessage);

                    // Actualizar la referencia al mensaje del asistente para que stopStream pueda
                    // acceder al contenido más reciente
                    assistantMessageRef.current = updatedMessage;

                    // Actualizar el mensaje en la UI
                    if (onMessageUpdate) {
                        onMessageUpdate(updatedMessage);
                    }
                }
            }

            return updatedMessage;
        },
        [processStreamData]
    );

    /**
     * Procesa y lee el stream de manera eficiente
     */
    const readAndProcessStream = useCallback(
        async (
            reader: ReadableStreamDefaultReader<Uint8Array>,
            assistantMessage: CustomUIMessage,
            chatHistory: CustomUIMessage[],
            onMessageUpdate?: (message: CustomUIMessage) => void,
            onMessageComplete?: (message: CustomUIMessage) => void
        ): Promise<CustomUIMessage> => {
            const decoder = new TextDecoder();
            let buffer = '';
            let currentMessage = assistantMessage;

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        // Agregar un evento de finalización
                        currentMessage = {
                            ...currentMessage,
                            events: [
                                ...(currentMessage.events || []),
                                {
                                    id: generateId(),
                                    timestamp: new Date(),
                                    type: 'complete',
                                    message: 'Respuesta completada'
                                }
                            ]
                        };

                        if (onMessageComplete) {
                            onMessageComplete(currentMessage);
                        }

                        // Check if the chatHistory already includes the assistant message
                        // This can happen if we're processing an existing chat
                        const assistantMessageExists = chatHistory.some(msg => msg.id === currentMessage.id);

                        // Create the final message list to save
                        let messagesToSave = assistantMessageExists
                            ? chatHistory.map(msg => (msg.id === currentMessage.id ? currentMessage : msg))
                            : [...chatHistory, currentMessage];

                        // Save chat messages after completion
                        console.log(`Saving chat with ${messagesToSave.length} messages after stream completion`);
                        await saveChatMessages(messagesToSave, chatId);
                        break;
                    }

                    // Decodificar el chunk y agregarlo al buffer
                    buffer += decoder.decode(value, { stream: true });

                    // Procesar líneas completas del buffer
                    const lines = buffer.split('[END_MESSAGE]\n');
                    buffer = lines.pop() || '';

                    currentMessage = await processStreamLines(lines, currentMessage, onMessageUpdate);
                }

                return currentMessage;
            } catch (error) {
                console.error('Error in stream processing:', error);
                throw error;
            }
        },
        [processStreamLines, saveChatMessages, chatId]
    );

    const streamChat = useCallback(
        async (chatHistory: CustomUIMessage[] = []) => {
            setIsLoading(true);

            // Log the chat history we're working with
            console.log(`Starting stream with ${chatHistory.length} messages for chat ${chatId}`);

            // Crear un nuevo AbortController para esta solicitud
            abortControllerRef.current = new AbortController();
            const { signal } = abortControllerRef.current;

            // Verify we have a valid chatId
            if (!chatId) {
                console.error('No chatId provided for streaming');
                setIsLoading(false);
                return null;
            }

            // Eliminar la verificación de chat existente y la lógica de creación previa
            // Ahora solo nos enfocaremos en enviar la solicitud con los mensajes actuales
            // El backend se encargará de crear el chat si no existe

            // Obtener el último mensaje para verificar información del agente
            const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

            // Crear mensaje inicial del asistente
            let assistantMessage = createInitialAssistantMessage(lastMessage);

            // Guardar referencia al mensaje del asistente para usarlo en stopStream
            assistantMessageRef.current = assistantMessage;

            // Iniciar el mensaje en la UI antes de cualquier operación
            if (onMessageStart) {
                onMessageStart(assistantMessage);
            }

            try {
                // Preparar el cuerpo de la solicitud
                const requestBody = {
                    chatId,
                    messages: chatHistory
                };

                console.log(`Sending request to ${apiUrl} for chat ${chatId} with ${chatHistory.length} messages`);

                // Realizar la solicitud fetch con streaming
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(requestBody),
                    signal
                });

                if (!response.ok || !response.body) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Procesar el stream
                const reader = response.body.getReader();

                // Leer y procesar el stream
                assistantMessage = await readAndProcessStream(reader, assistantMessage, chatHistory, onMessageUpdate, onMessageComplete);

                return assistantMessage;
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    // En caso de error, actualizar el mensaje con información del error
                    if (assistantMessage) {
                        assistantMessage = {
                            ...assistantMessage,
                            content: 'Lo siento, ocurrió un error al procesar tu solicitud.',
                            events: [
                                ...(assistantMessage.events || []),
                                {
                                    id: generateId(),
                                    timestamp: new Date(),
                                    type: 'error',
                                    message: `Error: ${error.message}`
                                }
                            ]
                        };

                        // Actualizar el mensaje en la UI
                        if (onMessageUpdate) {
                            onMessageUpdate(assistantMessage);
                        }

                        if (onMessageComplete) {
                            onMessageComplete(assistantMessage);
                        }

                        // Guardar el chat con el mensaje de error
                        if (chatHistory.length > 0) {
                            await saveChatMessages([...chatHistory, assistantMessage], chatId);
                        }
                    }

                    if (onError) {
                        onError(error);
                    }

                    return assistantMessage;
                }
                return null;
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [
            apiUrl,
            chatId,
            onMessageStart,
            onMessageUpdate,
            onMessageComplete,
            onError,
            saveChatMessages,
            readAndProcessStream,
            createInitialAssistantMessage,
            token,
            userEmail
        ]
    );

    const stopStream = useCallback(async () => {
        if (abortControllerRef.current) {
            console.log('Stopping stream...');
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);

            try {
                // Obtener el mensaje del asistente actual desde la referencia para información básica
                const currentAssistantMessage = assistantMessageRef.current;

                if (!currentAssistantMessage) {
                    console.error('No assistant message reference found when stopping stream');
                    return;
                }

                const messageId = currentAssistantMessage.id;
                console.log(`Stopping stream for message: ${messageId}`);

                // Obtener todos los mensajes actuales de la conversación desde el store
                // Esta es la fuente más confiable para el contenido actual
                const allMessages = getMessages ? getMessages() : [];
                console.log(`Current message count in store: ${allMessages.length}`);

                // Encontrar el mensaje del asistente en los mensajes actuales
                const currentMessageInStore = allMessages.find(msg => msg.id === messageId);

                // Si no encontramos el mensaje en el store, usamos la referencia como respaldo
                let currentContent = currentMessageInStore?.content || currentAssistantMessage.content || '';

                // Comprobar que el contenido existe y no está vacío después de quitar espacios
                const hasContent = Boolean(currentContent.trim());

                // Crear un evento de cancelación
                const cancelEvent = {
                    id: generateId(),
                    timestamp: new Date(),
                    type: 'cancelled',
                    message: 'La respuesta fue detenida por el usuario.'
                };

                // Decidir el contenido final
                let finalContent = currentContent;

                // Solo si realmente no hay contenido, usar el mensaje genérico
                if (!hasContent) {
                    finalContent = 'La respuesta fue detenida por el usuario.';
                    console.log('No se encontró contenido, usando mensaje genérico');
                } else {
                    // Si hay contenido, añadir una nota al final indicando que se detuvo
                    finalContent = finalContent.trim() + '\n\n_[La respuesta fue detenida por el usuario]_';
                    console.log('Preservando contenido existente:', finalContent);
                }

                // Construir el mensaje actualizado, preservando el contenido existente
                const updatedMessage: CustomUIMessage = {
                    ...currentAssistantMessage,
                    id: messageId,
                    role: 'assistant',
                    content: finalContent,
                    createdAt: currentAssistantMessage.createdAt || new Date(),
                    events: [...(currentAssistantMessage.events || []), cancelEvent]
                };

                // Actualizar la UI si el callback está disponible
                if (onMessageUpdate) {
                    onMessageUpdate(updatedMessage);
                }

                // Intentar obtener los mensajes del servidor primero, para asegurar una historia completa
                try {
                    console.log(`Fetching existing chat session for ${chatId}...`);
                    const response = await fetch(`${apiUrl}get-chat-session?chatId=${chatId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: token ? `Bearer ${token}` : ''
                        }
                    });

                    if (response.ok) {
                        const existingChat = await response.json();

                        if (existingChat && existingChat.messages && existingChat.messages.length > 0) {
                            console.log(`Retrieved ${existingChat.messages.length} messages from server for chat ${chatId}`);

                            // Replace or add the updated message in the existing messages
                            const updatedMessages = existingChat.messages.map((msg: CustomUIMessage) =>
                                msg.id === messageId ? updatedMessage : msg
                            );

                            // If our message doesn't exist in the server's messages, add it
                            if (!existingChat.messages.some((msg: CustomUIMessage) => msg.id === messageId)) {
                                updatedMessages.push(updatedMessage);
                            }

                            console.log(`Saving ${updatedMessages.length} messages after stopping stream`);
                            await saveChatMessages(updatedMessages, chatId);

                            if (onMessageComplete) {
                                onMessageComplete(updatedMessage);
                            }
                            return;
                        }
                    } else {
                        console.log(`No existing chat found for ${chatId} or error fetching it`);
                    }
                } catch (error) {
                    console.error('Error fetching existing chat messages:', error);
                }

                // Si no pudimos obtener los mensajes existentes del servidor, utilizar el store local
                let updatedMessages: CustomUIMessage[] = [];

                // Solo intentar guardar mensajes si tenemos un ID de chat válido
                if (!chatId) {
                    console.error('No valid chatId available for saving messages');
                    if (onMessageComplete) {
                        onMessageComplete(updatedMessage);
                    }
                    return;
                }

                if (allMessages.length > 0) {
                    // Mapear todos los mensajes, reemplazando solo el del asistente
                    updatedMessages = allMessages.map(msg => (msg.id === messageId ? updatedMessage : msg));

                    // If our message doesn't exist in the store messages, add it
                    if (!allMessages.some(msg => msg.id === messageId)) {
                        updatedMessages.push(updatedMessage);
                    }
                } else {
                    updatedMessages = [updatedMessage];
                }

                console.log(`Saving ${updatedMessages.length} messages from local store after stopping stream`);
                // Guardar los mensajes actualizados
                try {
                    await saveChatMessages(updatedMessages, chatId);
                    console.log('Messages saved successfully after stopping stream');
                } catch (saveError) {
                    console.error('Error saving messages after stopping stream:', saveError);
                }

                // Invocar el callback de finalización después de guardar si está disponible
                if (onMessageComplete) {
                    onMessageComplete(updatedMessage);
                }
            } catch (error) {
                console.error('Error general al detener el stream:', error);
            }
        } else {
            console.log('No active stream to stop');
        }
    }, [onMessageUpdate, onMessageComplete, saveChatMessages, getMessages, chatId, apiUrl, token]);

    return {
        streamChat,
        stopStream,
        saveMessageRating,
        isLoading
    };
}
