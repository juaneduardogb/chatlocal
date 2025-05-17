export type ThinkingEvent = {
    id: string;
    timestamp: Date;
    type: string;
    message: string;
};

export interface CustomToolInvocation {
    toolCallId: string;
    toolName: string;
    toolArgs: Record<string, unknown>;
    state: 'calling' | 'result';
    artifactArgs?: Record<string, unknown>;
    result?: unknown;
    createdAt: Date;
    endAt?: Date;
}

export interface ClientAttachment {
    name: string;
    contentType: string;
    url: string;
}

export interface AgentInfo {
    id: string;
    name: string;
    color: string;
}

// Tipo para la puntuación de los mensajes
export type MessageRating = 'positive' | 'negative' | null;

export interface CustomUIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
    content: string | null;
    createdAt?: Date;
    toolInvocations?: CustomToolInvocation[];
    experimentalAttachments?: ClientAttachment[];
    events?: ThinkingEvent[];
    agentInfo?: AgentInfo;
    rating?: MessageRating; // Campo para almacenar la puntuación del mensaje
}
