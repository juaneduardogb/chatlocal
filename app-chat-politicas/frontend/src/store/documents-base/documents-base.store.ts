import { create } from 'zustand';

import { Document } from '@/types/documents';

interface IKnowledgeStoreState {
    docSelected: Document | null;

    modalKnowledgeIsOpen: boolean;

    updateStatusModalUKB: (value?: boolean) => void;

    docSelectedInKnowledgeBase: (data: Document) => void;
}

const useKnowledgeBaseStore = create<IKnowledgeStoreState>((set, get) => ({
    docSelected: null,

    modalKnowledgeIsOpen: false,

    updateStatusModalUKB: (value?: boolean) => {
        const currentStatus = get().modalKnowledgeIsOpen;
        if (value !== undefined) {
            set({ modalKnowledgeIsOpen: value });
        } else {
            set({ modalKnowledgeIsOpen: !currentStatus });
        }
    },

    docSelectedInKnowledgeBase: (data: Document) => set({ docSelected: data })
}));

export default useKnowledgeBaseStore;
