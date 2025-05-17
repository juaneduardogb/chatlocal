import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define permission types
export interface Action {
    action_id: number;
    action_name: string;
    description?: string;
    is_function: boolean;
    active: boolean;
}

export interface Role {
    role_id: number;
    role_name: string;
    active: boolean;
    actions: Action[];
}

// Define permissions interface
export interface UserPermissions {
    roles: Role[];
    isLoading: boolean;
    isLoaded: boolean;
}

export interface AppStoreState {
    // User related state
    userEmail: string | null;
    setUserEmail: (email: string | null) => void;

    userPhoto: string | null;
    setUserPhoto: (photo: string | null) => void;

    userName: string | null;
    setUserName: (name: string | null) => void;

    // Auth token state
    token: string | null;
    setToken: (token: string | null) => void;

    // Permissions related state
    permissions: UserPermissions;
    setUserPermissions: (roles: Role[]) => void;
    setPermissionsLoading: (isLoading: boolean) => void;
    setPermissionsLoaded: (isLoaded: boolean) => void;
    hasPermission: (actionName: string) => boolean;
    hasRole: (roleName: string) => boolean;
    getRolesByAction: (actionName: string) => Role[];
    getActionsByRole: (roleName: string) => Action[];
    getAllActions: () => Action[];

    // Terms related state
    termsAccepted: boolean;
    setTermsAccepted: (accepted: boolean) => void;

    termsAcceptanceDate: string | null;
    setTermsAcceptanceDate: (date: string | null) => void;

    // Chat related state
    selectedAgent: {
        id: string;
        name: string;
        color: string;
    } | null;
    setSelectedAgent: (agent: { id: string; name: string; color: string } | null) => void;

    selectedChatId: string | null;
    setSelectedChatId: (chatId: string | null) => void;

    pinnedChatId: string | null;
    setPinnedChatId: (chatId: string | null) => void;

    // App configuration state
    requestsCount: number;
    setRequestsCount: (count: number) => void;

    maxRequests: number;
    setMaxRequests: (max: number) => void;

    apiUrl: string;
    setApiUrl: (url: string) => void;

    isAppConfigLoaded: boolean;
    setIsAppConfigLoaded: (loaded: boolean) => void;
}

export const useAppStore = create<AppStoreState>()(
    persist(
        (set, get) => ({
            // User related state
            userEmail: null,
            setUserEmail: (email: string | null) => set({ userEmail: email }),

            userPhoto: null,
            setUserPhoto: (photo: string | null) => set({ userPhoto: photo }),

            userName: null,
            setUserName: (name: string | null) => set({ userName: name }),

            // Auth token state
            token: null,
            setToken: (token: string | null) => set({ token: token }),

            // Permissions related state
            permissions: {
                roles: [],
                isLoading: false,
                isLoaded: false
            },
            setUserPermissions: (roles: Role[]) =>
                set(state => ({
                    permissions: { ...state.permissions, roles }
                })),
            setPermissionsLoading: (isLoading: boolean) =>
                set(state => ({
                    permissions: { ...state.permissions, isLoading }
                })),
            setPermissionsLoaded: (isLoaded: boolean) =>
                set(state => ({
                    permissions: { ...state.permissions, isLoaded }
                })),
            // Check if user has permission for a specific action
            hasPermission: (actionName: string): boolean => {
                const state = get();
                return state.permissions.roles.some(
                    role => role.active && role.actions.some(action => action.action_name === actionName && action.active)
                );
            },
            // Check if user has a specific role
            hasRole: (roleName: string): boolean => {
                const state = get();
                return state.permissions.roles.some(role => role.role_name.toLowerCase() === roleName.toLowerCase() && role.active);
            },
            // Get all roles that have a specific action
            getRolesByAction: (actionName: string): Role[] => {
                const state = get();
                return state.permissions.roles.filter(
                    role => role.active && role.actions.some(action => action.action_name === actionName && action.active)
                );
            },
            // Get all actions for a specific role
            getActionsByRole: (roleName: string): Action[] => {
                const state = get();
                const role = state.permissions.roles.find(r => r.role_name.toLowerCase() === roleName.toLowerCase() && r.active);
                return role ? role.actions.filter(action => action.active) : [];
            },
            // Get all actions available to the user (flattened)
            getAllActions: (): Action[] => {
                const state = get();
                const allActions: Action[] = [];
                const actionMap = new Map<number, Action>();

                // Collect all unique actions from all active roles
                state.permissions.roles.forEach(role => {
                    if (role.active) {
                        role.actions.forEach(action => {
                            if (action.active && !actionMap.has(action.action_id)) {
                                actionMap.set(action.action_id, action);
                                allActions.push(action);
                            }
                        });
                    }
                });

                return allActions;
            },

            // Terms related state
            termsAccepted: false,
            setTermsAccepted: (accepted: boolean) => set({ termsAccepted: accepted }),

            termsAcceptanceDate: null,
            setTermsAcceptanceDate: (date: string | null) => set({ termsAcceptanceDate: date }),

            // Chat related state
            selectedAgent: null,
            setSelectedAgent: (agent: { id: string; name: string; color: string } | null) => set({ selectedAgent: agent }),

            selectedChatId: null,
            setSelectedChatId: (chatId: string | null) => set({ selectedChatId: chatId }),

            pinnedChatId: null,
            setPinnedChatId: (chatId: string | null) => set({ pinnedChatId: chatId }),

            // App configuration state
            requestsCount: 0,
            setRequestsCount: (count: number) => set({ requestsCount: count }),

            maxRequests: 30,
            setMaxRequests: (max: number) => set({ maxRequests: max }),

            apiUrl: process.env.NODE_ENV === 'production' ? '/api/chat-ia' : 'http://localhost:8000',
            setApiUrl: (url: string) => set({ apiUrl: url }),

            isAppConfigLoaded: false,
            setIsAppConfigLoaded: (loaded: boolean) => set({ isAppConfigLoaded: loaded })
        }),
        {
            name: 'app-store',
            partialize: (state: AppStoreState) => ({
                userEmail: state.userEmail,
                userPhoto: state.userPhoto,
                userName: state.userName,
                token: state.token,
                termsAccepted: state.termsAccepted,
                termsAcceptanceDate: state.termsAcceptanceDate,
                selectedAgent: state.selectedAgent,
                pinnedChatId: state.pinnedChatId,
                apiUrl: state.apiUrl
            })
        }
    )
);
