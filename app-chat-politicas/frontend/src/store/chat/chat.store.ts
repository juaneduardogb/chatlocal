import { createIdGenerator } from 'ai';
import { create } from 'zustand';

import { ChatSession } from '@/types/chat-session';
import { CustomUIMessage, MessageRating } from '@/types/message';

interface ChatState {
    messages: CustomUIMessage[];
    isLoading: boolean;
    isRenameModalOpen: boolean;
    isDeleteModalOpen: boolean;
    selectedChat: ChatSession | null;
    newTitle: string;

    // Message actions
    addMessage: (message: CustomUIMessage) => void;
    updateMessage: (messageId: string, updatedMessage: Partial<CustomUIMessage>) => void;
    setMessages: (messages: CustomUIMessage[]) => void;
    clearMessages: () => void;
    setIsLoading: (isLoading: boolean) => void;
    createUserMessage: (content: string) => CustomUIMessage;
    updateMessageRating: (messageId: string, rating: MessageRating) => void;

    // Modal actions
    setIsRenameModalOpen: (isOpen: boolean) => void;
    setIsDeleteModalOpen: (isOpen: boolean) => void;
    setSelectedChat: (chat: ChatSession | null) => void;
    setNewTitle: (title: string) => void;
}

export const generateId = createIdGenerator({
    prefix: 'pwc_cl_user_msg',
    separator: '_',
    size: 10
});

export const generateChatId = createIdGenerator({
    prefix: 'chat_cl',
    separator: '_',
    size: 20
});

export const useChatStore = create<ChatState>(set => ({
    messages: [],
    isLoading: false,
    isRenameModalOpen: false,
    isDeleteModalOpen: false,
    selectedChat: null,
    newTitle: '',

    addMessage: message =>
        set(state => ({
            messages: [...state.messages, message]
        })),

    updateMessage: (messageId, updatedMessage) =>
        set(state => ({
            messages: state.messages.map(msg => (msg.id === messageId ? { ...msg, ...updatedMessage } : msg))
        })),

    setMessages: messages => set({ messages }),

    clearMessages: () =>
        set(_ => ({
            messages: [],
            selectedChat: null,
            newTitle: ''
        })),

    setIsLoading: isLoading => {
        set({ isLoading });
    },

    createUserMessage: content => {
        const message: CustomUIMessage = {
            id: generateId(),
            role: 'user',
            content,
            createdAt: new Date()
        };
        return message;
    },

    updateMessageRating: (messageId, rating) =>
        set(state => ({
            messages: state.messages.map(msg => (msg.id === messageId ? { ...msg, rating } : msg))
        })),

    // Modal actions
    setIsRenameModalOpen: isOpen => set({ isRenameModalOpen: isOpen }),
    setIsDeleteModalOpen: isOpen => set({ isDeleteModalOpen: isOpen }),
    setSelectedChat: chat => set({ selectedChat: chat }),
    setNewTitle: title => set({ newTitle: title })
}));
