import { Navigate } from 'react-router-dom';

import routes from '@/constants/routes';
import useUserPermissions from '@/hooks/app/useUserPermissions';
import PermissionDenied from '@/pages/PermissionDenied';
import { useAppStore } from '@/store/app';

interface ProtectedRouteProps {
    children: React.ReactNode;
    permissionCheck: () => boolean;
    fallbackPath?: string;
    showDeniedPage?: boolean;
}

/**
 * A component that renders its children only if the user has the necessary permissions.
 * Otherwise, it redirects to the fallback path or shows the permission denied page.
 */
const ProtectedRoute = ({ children, permissionCheck, fallbackPath = routes.chat.name, showDeniedPage = true }: ProtectedRouteProps) => {
    const { permissions } = useAppStore();
    const { isLoading } = useUserPermissions();

    // If permissions are still loading, we can show a loading indicator
    // or return null to prevent flickering
    if (isLoading || !permissions.isLoaded) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        );
    }

    // Check if the user has the necessary permissions
    const hasPermission = typeof permissionCheck === 'function' && permissionCheck();

    // If the user doesn't have the permissions, either show denied page or redirect
    if (!hasPermission) {
        return showDeniedPage ? <PermissionDenied /> : <Navigate to={fallbackPath} replace />;
    }

    // Otherwise, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
