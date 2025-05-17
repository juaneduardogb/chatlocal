import { CustomUIMessage } from './message';
export interface ChatSession {
    chatId: string;
    userEmail: string;
    title?: string;
    messages: CustomUIMessage[];
    createdAt: Date;
    updatedAt: Date;
}
