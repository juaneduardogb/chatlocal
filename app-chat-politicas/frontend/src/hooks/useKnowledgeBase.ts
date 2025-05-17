import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '../store/app';

import { backendEndpoints } from '@/constants/backend-routes';
import { DocumentResponse } from '@/models/documents';
import {
    BasicPerson,
    ContractType,
    KnowledgeBase,
    KnowledgeMassiveConfiguration,
    LineOfService,
    ProfilesAllowed,
    TypeOfWorkday
} from '@/types/documents';

// Funciones auxiliares para realizar llamadas API
const createKnowledgeBase = async (payload: {
    name: string | null;
    description: string | null;
    author: string;
    totalDocuments: number;
    los: LineOfService[] | null;
    losOwner: string | null;
    subLoS: string | null;
    support: BasicPerson[] | null;
    profiles: ProfilesAllowed[] | null;
    typeOfWorkday: TypeOfWorkday[] | null;
    contractType: ContractType[] | null;
}): Promise<KnowledgeBase> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.post(`${process.env.BACKEND_URL}${backendEndpoints.CREATE_KNOWLEDGE_BASE}`, payload, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

const massiveConfiguration = async (form: KnowledgeMassiveConfiguration) => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.post(`${process.env.BACKEND_URL}${backendEndpoints.MASSIVE_KNOWLEDGE_CONFG}`, form, {
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

const getAllKnowledgeBase = async (): Promise<KnowledgeBase[]> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.get(`${process.env.BACKEND_URL}${backendEndpoints.GET_ALL_KNOWLEDGE_BASE}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

const deleteKnowledgeBase = async (knowledgeId: string): Promise<KnowledgeBase> => {
    // Obtener el token del store
    const { token } = useAppStore.getState();

    const { data } = await axios.delete(`${process.env.BACKEND_URL}${backendEndpoints.DELETE_KNOWLEDGE_BASE}${knowledgeId}`, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

// Hook para crear una base de conocimiento
export const useKnowledgeBaseCreate = () => {
    const { userEmail } = useAppStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
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
        }: {
            name: string | null;
            description: string | null;
            totalDocuments: File[] | null;
            los: LineOfService[] | null;
            losOwner: string | null;
            subLoS: string | null;
            support: BasicPerson[] | null;
            profiles: ProfilesAllowed[] | null;
            typeOfWorkday: TypeOfWorkday[] | null;
            contractType: ContractType[] | null;
        }) => {
            return createKnowledgeBase({
                name,
                description,
                author: userEmail || '',
                totalDocuments: totalDocuments?.length || 0,
                los,
                losOwner,
                subLoS,
                support,
                profiles,
                typeOfWorkday,
                contractType
            });
        },
        onSuccess: () => {
            // Invalidar la consulta para actualizar la lista de bases de conocimiento
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        }
    });
};

// Hook para configuración masiva de conocimiento
export const useKnowledgeMassiveConfiguration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: massiveConfiguration,
        onSuccess: () => {
            // Invalidar la consulta para actualizar la lista de bases de conocimiento
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        }
    });
};

// Hook para obtener documentos de una base de conocimiento
export const useDocumentsFromKnowledge = (knowledgeBaseId: string) => {
    return useQuery({
        queryKey: ['documents', knowledgeBaseId],
        queryFn: () => getDocumentsFromKnowledge(knowledgeBaseId),
        enabled: !!knowledgeBaseId // Solo ejecutar si hay un ID válido
    });
};

// Hook para obtener todas las bases de conocimiento
export const useGetAllKnowledgeBase = () => {
    return useQuery({
        queryKey: ['knowledgeBase'],
        queryFn: getAllKnowledgeBase,
        staleTime: 5 * 60 * 1000 // 5 minutos antes de considerar los datos obsoletos
    });
};

// Hook para eliminar una base de conocimiento
export const useDeleteKnowledgeBase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteKnowledgeBase,
        onSuccess: () => {
            // Invalidar la consulta para actualizar la lista de bases de conocimiento
            queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
        }
    });
};
