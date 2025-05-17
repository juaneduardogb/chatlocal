import { Role, Action } from '@/store/app';

// Define standard action names to avoid typos throughout the codebase
export const ACTIONS = {
    // Document permissions
    DOCUMENT_VIEW: '/documents/view',
    DOCUMENT_MANAGE: '/documents/manage',
    DOCUMENT_UPLOAD: '/documents/upload',
    DOCUMENT_DELETE: '/documents/delete',

    // Knowledge base permissions
    KNOWLEDGE_BASE_VIEW: '/knowledge-base/view',
    KNOWLEDGE_BASE_MANAGE: '/knowledge-base/manage',
    KNOWLEDGE_BASE_CREATE: '/knowledge-base/create',
    KNOWLEDGE_BASE_DELETE: '/knowledge-base/delete',

    // Chat permissions
    CHAT_VIEW: '/chat/view',
    CHAT_CREATE: '/chat/create',
    CHAT_DELETE: '/chat/delete'
};

// Define standard role names
export const ROLES = {
    ADMIN: 'administrador',
    USER: 'user',
    CONTRIBUTOR: 'contributor',
    VIEWER: 'viewer'
};

/**
 * Utility to check if an action is in a specific category
 * @param actionName Name of the action to check
 * @param category Category prefix to check against
 */
export const isActionInCategory = (actionName: string, category: string): boolean => {
    return actionName.startsWith(category);
};

/**
 * Utility to get all actions from a specific category
 * @param actions List of actions to filter
 * @param category Category prefix to filter by
 * @returns Filtered list of actions
 */
export const getActionsByCategory = (actions: Action[], category: string): Action[] => {
    return actions.filter(action => isActionInCategory(action.action_name, category));
};

/**
 * Helper to create a permission display name from an action name
 * @param actionName Raw action name (e.g., "/documents/delete")
 * @returns User-friendly display name (e.g., "Delete Documents")
 */
export const createPermissionDisplayName = (actionName: string): string => {
    // Remove leading slash and split by remaining slashes
    const parts = actionName.replace(/^\//, '').split('/');

    if (parts.length < 2) {
        return actionName;
    }

    // Convert category to title case
    const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

    // Convert action to title case
    const action = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

    return `${action} ${category}`;
};

/**
 * Returns a clean, displayed list of permissions for UI presentation
 * @param role The role containing permissions to display
 * @returns Formatted list of permission names
 */
export const getFormattedPermissionsForRole = (role: Role): string[] => {
    return role.actions.filter(action => action.active).map(action => createPermissionDisplayName(action.action_name));
};

export default {
    ACTIONS,
    ROLES,
    isActionInCategory,
    getActionsByCategory,
    createPermissionDisplayName,
    getFormattedPermissionsForRole
};
