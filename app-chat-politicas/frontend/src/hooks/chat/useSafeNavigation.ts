import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar la navegación segura evitando redirecciones en bucle
 * @returns Objeto con métodos para navegar de forma segura y comprobar si hubo redirecciones recientes
 */
export function useSafeNavigation() {
    const navigate = useNavigate();
    const lastRedirectTimeRef = useRef<number>(0);

    const hasRecentlyRedirected = useCallback(() => {
        const now = Date.now();
        const timeSinceLastRedirect = now - lastRedirectTimeRef.current;
        return timeSinceLastRedirect < 2000;
    }, []);

    const markRedirection = useCallback(() => {
        lastRedirectTimeRef.current = Date.now();
    }, []);

    const safeNavigate = useCallback(
        (to: string, options?: unknown) => {
            markRedirection();
            navigate(to, options);
        },
        [navigate, markRedirection]
    );

    return { safeNavigate, hasRecentlyRedirected };
}
