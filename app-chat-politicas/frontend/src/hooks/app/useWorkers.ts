import { useQuery } from '@tanstack/react-query';

import { backendEndpoints } from '@/constants/backend-routes';

// Función para obtener los trabajadores
const fetchWorkers = async () => {
    const response = await fetch(backendEndpoints.WORKERS_API);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const responseJson = await response.json();
    return responseJson.results;
};

// Hook que utiliza useQuery para la gestión del estado de la consulta
export const useWorkers = () => {
    return useQuery({
        queryKey: ['workers'],
        queryFn: fetchWorkers,
        staleTime: 5 * 60 * 1000 // 5 minutos antes de considerar los datos obsoletos
    });
};
