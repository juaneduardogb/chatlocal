import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { backendEndpoints } from '@/constants/backend-routes';
import { useAppStore } from '@/store/app';
import { ExtractTextFromDocumentResponse } from '@/types/documents';
import { convertSize } from '@/utilities/utils';

// Función para extraer contenido de archivos
const extractContentFromFile = async (file: File): Promise<ExtractTextFromDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Obtener el token del store
    const { token } = useAppStore.getState();

    try {
        const { data } = await axios.post(`${process.env.BACKEND_URL}${backendEndpoints.EXTRACT_TEXT_FROM_DOCUMENT_BASE}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : ''
            }
        });

        return data;
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
};

// Hook que utiliza useMutation para extraer contenido de archivos
export const useExtractContent = () => {
    return useMutation({
        mutationFn: extractContentFromFile
    });
};
