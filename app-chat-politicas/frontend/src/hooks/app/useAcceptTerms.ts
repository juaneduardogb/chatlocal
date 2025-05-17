import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { useAppStore } from '@/store/app';

interface AcceptTermsPayload {
    accepted: boolean;
}

// Función para enviar la aceptación de términos
const acceptTerms = async (payload: AcceptTermsPayload) => {
    const { apiUrl, token } = useAppStore.getState();
    const { data } = await axios.post(`${apiUrl}/app-config/accept-terms`, payload, {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    return data;
};

// Hook que utiliza useMutation para gestionar la aceptación de términos
export const useAcceptTerms = () => {
    const { setTermsAccepted, setTermsAcceptanceDate } = useAppStore();

    return useMutation({
        mutationFn: acceptTerms,
        onSuccess: () => {
            // Al aceptar los términos exitosamente, actualizamos el estado global
            const currentDate = new Date().toISOString();
            setTermsAccepted(true);
            setTermsAcceptanceDate(currentDate);
        }
    });
};
