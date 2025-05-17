import axios from 'axios';
import { create } from 'zustand';

import { DocumentCreationForm, DocumentUpdateForm } from '@/models/documents';
import {
    Document,
    TagsElements,
    BasicPerson,
    ProfilesAllowed,
    LineOfService,
    KnowledgeBase,
    ExtractTextFromDocumentResponse,
    TypeOfWorkday,
    ContractType
} from '@/types/documents';
import { convertSize } from '@/utilities/utils';

// Tipo genérico para funciones de mutación
type MutationObject<TData, TParams> =
    | {
          mutateAsync: (params: TParams) => Promise<TData>;
      }
    | ((params: TParams) => Promise<TData>);

// Función auxiliar para obtener la mutateAsync de cualquier tipo de objeto de mutación
function getMutateAsync<TData, TParams>(mutationObj: MutationObject<TData, TParams>): (params: TParams) => Promise<TData> {
    if (typeof mutationObj === 'function') {
        return mutationObj;
    } else if (mutationObj && 'mutateAsync' in mutationObj) {
        return mutationObj.mutateAsync;
    }
    throw new Error('Invalid mutation object provided');
}

interface ToastMessage {
    title: string;
    description: string;
    variant: 'success' | 'destructive';
    duration: number;
}

interface DocumentFormStoreState {
    callFromDrawerDocumentHeader: boolean;

    los: LineOfService[] | null;
    losOwner: string | null;
    subLoS: string | null;
    labels: TagsElements[] | null; // etiquetas que solicita extraer el usuario
    tagsByAuthor: TagsElements[] | null; // etiquetas personalizadas del usuario
    support: BasicPerson[] | null;
    profiles: ProfilesAllowed[] | null;
    typeOfWorkday: TypeOfWorkday[] | null;
    contractType: ContractType[] | null;
    files: File[] | null;
    knowledgeId: string | null;
    name: string | null;
    description: string | null;
    author: number | null; // guid
    createdAt: Date | null;
    lastUpdate: Date | null;
    toastMessage: ToastMessage | null;

    callSubmitDrawerDocument: (value: boolean) => void;

    saveFiles: (files: File[]) => void;

    saveTitleAndDescription: (title: string, description: string) => void;

    saveConfiguration: (
        tags: TagsElements[],
        tagsByAuthor: TagsElements[],
        los: LineOfService[],
        profiles: ProfilesAllowed[],
        losOwner: string,
        subLoS: string,
        typeOfWorkday: TypeOfWorkday[],
        contractType: ContractType[],
        support: BasicPerson[]
    ) => void;

    clear: () => void;

    submitKnowledgeBaseAndDocument: (
        knowledgeBaseCreateMutationFn: MutationObject<KnowledgeBase, unknown>
    ) => Promise<KnowledgeBase | null>;

    deleteKnowledgeBase: (
        knowledgeId: string,
        deleteKnowledgeBaseMutationFn: MutationObject<KnowledgeBase, string>
    ) => Promise<KnowledgeBase | null>;

    extractContentFromFiles: (
        file: File,
        extractContentMutationFn: MutationObject<ExtractTextFromDocumentResponse, File>
    ) => Promise<ExtractTextFromDocumentResponse | null>;

    createDocument: (
        document: DocumentCreationForm,
        documentCreateMutationFn: MutationObject<ExtractTextFromDocumentResponse, DocumentCreationForm>
    ) => Promise<ExtractTextFromDocumentResponse | null>;

    updateDocument: (
        data: DocumentUpdateForm,
        documentUpdateMutationFn: MutationObject<Document, DocumentUpdateForm>
    ) => Promise<Document | null>;
}

export const useDocumentFormStore = create<DocumentFormStoreState>((set, get) => ({
    callFromDrawerDocumentHeader: false,

    los: null,
    losOwner: null,
    subLoS: null,
    labels: null,
    tagsByAuthor: null,
    support: null,
    profiles: null,
    files: null,
    knowledgeId: null,
    name: null,
    description: null,
    author: null,
    typeOfWorkday: null,
    contractType: null,
    createdAt: null,
    lastUpdate: null,
    toastMessage: null,

    callSubmitDrawerDocument: (value: boolean) => set({ callFromDrawerDocumentHeader: value }),

    /**
     * Métodos para guardar información
     * en el store para alimentar e
     * interactuar con los formularios
     * y vistas.
     */

    saveFiles: (files: File[]) => {
        set({ files: files });
    },

    saveTitleAndDescription: (title: string, description: string) => {
        set({ name: title, description: description });
    },

    saveConfiguration: (
        tags: TagsElements[],
        tagsByAuthor: TagsElements[],
        los: LineOfService[],
        profiles: ProfilesAllowed[],
        losOwner: string,
        subLoS: string,
        typeOfWorkday: TypeOfWorkday[],
        contractType: ContractType[],
        support: BasicPerson[]
    ) => {
        set({
            labels: tags,
            tagsByAuthor: tagsByAuthor,
            los: los,
            profiles: profiles,
            losOwner: losOwner,
            subLoS: subLoS,
            support: support,
            typeOfWorkday: typeOfWorkday,
            contractType: contractType
        });
    },

    clear: () =>
        set({
            los: null,
            losOwner: null,
            subLoS: null,
            labels: null,
            support: null,
            profiles: null,
            files: null,
            knowledgeId: null,
            name: null,
            description: null,
            author: null,
            createdAt: null,
            lastUpdate: null,
            toastMessage: null
        }),

    /**
     * Métodos para interactuar con el backend
     * tanto para:
     * 1. crear base de conocimiento
     * 2. eliminar base de conocimiento
     * 2. extraer texto de archivo
     * 3. crear documento
     * 4. eliminar un documento
     * 5. actualizar un documento.
     *
     */
    submitKnowledgeBaseAndDocument: async (knowledgeBaseCreateMutationFn: MutationObject<KnowledgeBase, unknown>) => {
        const { name, description, files: totalDocuments, los, losOwner, subLoS, support, profiles, typeOfWorkday, contractType } = get();

        try {
            // Si no se proporciona la función de mutación, no podemos continuar
            if (!knowledgeBaseCreateMutationFn || !getMutateAsync(knowledgeBaseCreateMutationFn)) {
                console.error('knowledgeBaseCreateMutationFn.mutateAsync is required but was not provided');
                return null;
            }

            // Usar la función de mutación proporcionada en lugar de llamar directamente al hook
            const response = await getMutateAsync(knowledgeBaseCreateMutationFn)({
                name,
                description,
                totalDocuments,
                los,
                losOwner,
                subLoS,
                support,
                profiles,
                typeOfWorkday,
                contractType
            });

            set({
                toastMessage: {
                    title: 'Base de conocimiento',
                    description: 'Se ha creado correctamente la base de conocimientos.',
                    variant: 'success',
                    duration: 5000
                }
            });
            return response;
        } catch (error: unknown) {
            let errorMessage = 'An unexpected error occurred.';
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`Error: ${error.response.data.message} (Status: ${error.response.status})`);
                    errorMessage = `Error: ${error.response.data.message} (Status: ${error.response.status})`;
                } else {
                    console.error('Error:', error.message);
                    errorMessage = `Error: ${error.message}`;
                }
            } else {
                console.error(errorMessage, error);
            }
            set({
                toastMessage: {
                    title: 'Error al crear base de conocimiento',
                    description: 'No ha sido posible crear la base de conocimientos debido a problemas del sistema.',
                    variant: 'destructive',
                    duration: 5000
                }
            });
            return null;
        }
    },

    deleteKnowledgeBase: async (knowledgeId: string, deleteKnowledgeBaseMutationFn: MutationObject<KnowledgeBase, string>) => {
        try {
            const response = await getMutateAsync(deleteKnowledgeBaseMutationFn)(knowledgeId);

            set({
                toastMessage: {
                    title: 'Base de conocimiento eliminada',
                    description: 'La base de conocimientos ha sido eliminada correctamente.',
                    variant: 'success',
                    duration: 5000
                }
            });
            return response;
        } catch (error: unknown) {
            let errorMessage = 'An unexpected error occurred.';
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`Error: ${error.response.data.message} (Status: ${error.response.status})`);
                    errorMessage = `Error: ${error.response.data.message} (Status: ${error.response.status})`;
                } else {
                    console.error('Error:', error.message);
                    errorMessage = `Error: ${error.message}`;
                }
            } else {
                console.error(errorMessage, error);
            }
            set({
                toastMessage: {
                    title: 'Error al eliminar base de conocimiento',
                    description: 'No ha sido posible eliminar la base de conocimientos debido a problemas del sistema.',
                    variant: 'destructive',
                    duration: 5000
                }
            });
            return null;
        }
    },

    extractContentFromFiles: async (file: File, extractContentMutationFn: MutationObject<ExtractTextFromDocumentResponse, File>) => {
        try {
            const response = await getMutateAsync(extractContentMutationFn)(file);

            return response;
        } catch (error) {
            console.error('Error uploading file:', file.name, error);
            return {
                documentContent: null,
                documentUrl: null,
                documentUniqueName: null,
                sizeFormatted: convertSize(file.size),
                size: file.size,
                documentName: file.name
            };
        }
    },

    createDocument: async (
        document: DocumentCreationForm,
        documentCreateMutationFn: MutationObject<ExtractTextFromDocumentResponse, DocumentCreationForm>
    ) => {
        try {
            const response = await getMutateAsync(documentCreateMutationFn)(document);

            return response;
        } catch {
            return {
                documentContent: null,
                documentUrl: null,
                documentUniqueName: null,
                sizeFormatted: document.sizeFormatted,
                size: document.size,
                documentName: document.documentName
            };
        }
    },

    updateDocument: async (data: DocumentUpdateForm, documentUpdateMutationFn: MutationObject<Document, DocumentUpdateForm>) => {
        try {
            const response = await getMutateAsync(documentUpdateMutationFn)(data);

            return response;
        } catch (error: unknown) {
            let errorMessage = 'An unexpected error occurred.';
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`Error: ${error.response.data.message} (Status: ${error.response.status})`);
                    errorMessage = `Error: ${error.response.data.message} (Status: ${error.response.status})`;
                } else {
                    console.error('Error:', error.message);
                    errorMessage = `Error: ${error.message}`;
                }
            } else {
                console.error(errorMessage, error);
            }
            return null;
        }
    }
}));
