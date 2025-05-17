import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';

import { useAppStore, Role } from '@/store/app';
import { ACTIONS, ROLES } from '@/utilities/permissions';

// Interface para la respuesta de permisos del servidor
interface UserPermissionsResponse {
    roles: Role[];
}

// Función para obtener los permisos del usuario
const fetchUserPermissions = async (apiUrl: string, token: string | null): Promise<UserPermissionsResponse> => {
    if (!token) {
        throw new Error('No authentication token available');
    }

    try {
        const response = await axios.get<UserPermissionsResponse>(`${apiUrl}/app-config/user/actions?legacy_format=false`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        // Retornar permisos por defecto en caso de error
        return {
            roles: [
                {
                    role_id: 0,
                    role_name: ROLES.USER,
                    active: true,
                    actions: [
                        {
                            action_id: 0,
                            action_name: ACTIONS.CHAT_VIEW,
                            description: 'View chat',
                            is_function: false,
                            active: true
                        }
                    ]
                }
            ]
        };
    }
};

/**
 * Hook to fetch and manage user permissions using TanStack Query
 */
export function useUserPermissions() {
    const {
        apiUrl,
        token,
        permissions,
        setUserPermissions,
        setPermissionsLoading,
        setPermissionsLoaded,
        hasPermission,
        hasRole,
        getRolesByAction,
        getActionsByRole,
        getAllActions
    } = useAppStore();

    // Utilizando useQuery para gestionar la obtención de permisos
    const { isLoading, isError, data, refetch } = useQuery({
        queryKey: ['userPermissions', token],
        queryFn: () => fetchUserPermissions(apiUrl, token),
        enabled: !!token && !permissions.isLoaded,
        staleTime: 5 * 60 * 1000 // 5 minutos
    });

    // Actualizamos el estado global cuando se completa la consulta
    useEffect(() => {
        if (data) {
            setUserPermissions(data.roles);
            setPermissionsLoaded(true);
        }
    }, [data, setUserPermissions, setPermissionsLoaded]);

    // Actualizamos el estado de carga en el store global
    useEffect(() => {
        setPermissionsLoading(isLoading);
    }, [isLoading, setPermissionsLoading]);

    // Manejamos el caso de error
    useEffect(() => {
        if (isError) {
            setUserPermissions([
                {
                    role_id: 0,
                    role_name: ROLES.USER,
                    active: true,
                    actions: [
                        {
                            action_id: 0,
                            action_name: ACTIONS.CHAT_VIEW,
                            description: 'View chat',
                            is_function: false,
                            active: true
                        }
                    ]
                }
            ]);
            setPermissionsLoaded(true);
        }
    }, [isError, setUserPermissions, setPermissionsLoaded]);

    // Custom check for specific page/feature access
    const canAccessKnowledgeBase = () => {
        return hasRole(ROLES.ADMIN) || hasPermission(ACTIONS.KNOWLEDGE_BASE_MANAGE) || hasPermission(ACTIONS.KNOWLEDGE_BASE_VIEW);
    };

    const canAccessDocuments = () => {
        return hasPermission(ACTIONS.DOCUMENT_MANAGE) || hasRole(ROLES.ADMIN) || hasPermission(ACTIONS.DOCUMENT_VIEW);
    };

    const canAccessChat = () => {
        return hasPermission(ACTIONS.CHAT_VIEW) || true; // Allow everyone to access chat by default
    };

    const getPermissionsByRole = (roleName: string): string[] => {
        const actions = getActionsByRole(roleName);
        return actions.map(action => action.action_name);
    };

    // Feature-specific permission checks
    const canCreateNewKnowledgeBase = () => {
        return hasPermission(ACTIONS.KNOWLEDGE_BASE_CREATE) || hasRole(ROLES.ADMIN);
    };

    const canDeleteKnowledgeBase = () => {
        return hasPermission(ACTIONS.KNOWLEDGE_BASE_DELETE) || hasRole(ROLES.ADMIN);
    };

    const canUploadDocuments = () => {
        return hasPermission(ACTIONS.DOCUMENT_UPLOAD) || hasRole(ROLES.ADMIN);
    };

    const canDeleteDocuments = () => {
        return hasPermission(ACTIONS.DOCUMENT_DELETE) || hasRole(ROLES.ADMIN);
    };

    return {
        isLoading,
        isLoaded: permissions.isLoaded,
        fetchUserPermissions: refetch,
        hasPermission,
        hasRole,
        getRolesByAction,
        getActionsByRole,
        getAllActions,
        getPermissionsByRole,
        // Feature access helpers
        canAccessKnowledgeBase,
        canAccessDocuments,
        canAccessChat,
        // Feature-specific permission checks
        canCreateNewKnowledgeBase,
        canDeleteKnowledgeBase,
        canUploadDocuments,
        canDeleteDocuments
    };
}

export default useUserPermissions;
