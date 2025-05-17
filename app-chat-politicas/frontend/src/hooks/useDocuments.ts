import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { backendEndpoints } from '@/constants/backend-routes';
import { DeleteDocumentResponse, DocumentCreationForm, DocumentResponse, DocumentUpdateForm } from '@/models/documents';
import { useAppStore } from '@/store/app';
import { Document, DocumentsByUserResponse, ExtractTextFromDocumentResponse } from '@/types/documents';

// Funciones de API para ser utilizadas por los hooks
const deleteDocument = async (documentId: string): Promise<DeleteDocumentResponse> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.delete(`${process.env.BACKEND_URL}${backendEndpoints.DELETE_DOCUMENT}${documentId}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

const updateDocument = async (document: DocumentUpdateForm): Promise<Document> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.put(`${process.env.BACKEND_URL}${backendEndpoints.UPDATE_DOCUMENT}`, document, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

const createDocument = async (document: DocumentCreationForm): Promise<ExtractTextFromDocumentResponse> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.post(`${process.env.BACKEND_URL}${backendEndpoints.CREATE_DOCUMENT}`, document, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

const getDocumentsFromKnowledge = async (knowledgeBaseId: string): Promise<DocumentResponse> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.get(
        `${process.env.BACKEND_URL}${backendEndpoints.GET_ALL_DOCUMENTS_FROM_KNOWLEDGE_BASE}${knowledgeBaseId}`,
        {
            headers: {
                Authorization: token ? `Bearer ${token}` : ''
            }
        }
    );
    return data;
};

const getAllDocuments = async (): Promise<DocumentsByUserResponse> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.get(`${process.env.BACKEND_URL}${backendEndpoints.GET_ALL_DOCUMENTS}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

// Hook para eliminar un documento
export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            // Invalidar consultas relevantes para actualizar datos
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
};

// Hook para actualizar un documento
export const useDocumentUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateDocument,
        onSuccess: data => {
            // Invalidar consultas relevantes y actualizar caché
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['document', data.id] });
        }
    });
};

// Hook para crear un documento
export const useDocumentCreate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createDocument,
        onSuccess: () => {
            // Invalidar consultas relevantes para actualizar lista de documentos
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
};

// Hook para obtener documentos de una base de conocimiento
export const useDocumentsFromKnowledge = (knowledgeBaseId: string) => {
    return useQuery({
        queryKey: ['documents', 'knowledge', knowledgeBaseId],
        queryFn: () => getDocumentsFromKnowledge(knowledgeBaseId),
        enabled: !!knowledgeBaseId // Solo ejecutar si hay un ID válido
    });
};

// Hook para obtener todos los documentos
export const useDocuments = () => {
    return useQuery({
        queryKey: ['documents'],
        queryFn: getAllDocuments,
        staleTime: 5 * 60 * 1000 // 5 minutos antes de considerar los datos obsoletos
    });
};
