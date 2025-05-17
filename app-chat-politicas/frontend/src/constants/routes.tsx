import { Navigate, createBrowserRouter } from 'react-router-dom';

import AppInitializer from '@/components/AppInitializer';
import Chat from '@/pages/chat/Chat';
import DocumentBase from '@/pages/DocumentBase/DocumentBase';
import DocumentsUploadStage from '@/pages/DocumentsUploadStage/DocumentsUploadStage';
import KnowledgeBaseView from '@/pages/KnowledgeBase/KnowledgeBaseView';
import LayoutCustom from '@/layout/LayoutCustom';
import NotFound from '@/pages/not-found/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserAuthentication } from 'package_entra_id';
import { useAppStore } from '@/store/app';
import { useEffect } from 'react';
import useUserPermissions from '@/hooks/app/useUserPermissions';

// Base paths
const BASE_PATH = '/chatia';

// Define routes as constants with consistent structure
const routes = {
    home: {
        name: `${BASE_PATH}/home`
    },
    fileList: {
        name: `${BASE_PATH}/create-document`
    },
    chat: {
        name: `${BASE_PATH}/new`
    },
    loadChat: {
        name: `${BASE_PATH}/conversation/:chatId`,
        path: `${BASE_PATH}/conversation`,
        create: (chatId: string) => `${BASE_PATH}/conversation/${chatId}`
    },
    documentSelect: {
        name: `${BASE_PATH}/document-form-selection`
    },
    documentForm: {
        name: `${BASE_PATH}/document-form`
    },
    documentSummary: {
        name: `${BASE_PATH}/document-summary`
    },
    documentBase: {
        name: `${BASE_PATH}/document-base`
    },
    documentUploadStage: {
        name: `${BASE_PATH}/upload-stage`
    },
    knowledgeBase: {
        name: `${BASE_PATH}/knowledge-base`,
        dynamicParams: `${BASE_PATH}/knowledge-base/:knowledgeBaseId`
    }
};

// Componente que combina la autenticación y la inicialización de la aplicación
const AuthenticatedApp = ({ children }: { children: React.ReactNode }) => {
    return (
        <UserAuthentication loginUrl='https://operationhub-dev.pwcinternal.com/'>
            <AppInitUserEmail>
                <AppInitializer>{children}</AppInitializer>
            </AppInitUserEmail>
        </UserAuthentication>
    );
};

// Componente para inicializar el email del usuario
const AppInitUserEmail = ({ children }: { children: React.ReactNode }) => {
    const { setUserEmail } = useAppStore();

    useEffect(() => {
        // Obtener información del usuario autenticado
        // Simulamos un usuario para pruebas - esto debería venir de la autenticación real
        const userEmail = localStorage.getItem('user_email') || 'usuario@pwc.com';
        setUserEmail(userEmail);
    }, [setUserEmail]);

    return <>{children}</>;
};

// Create wrapper components for protected routes
const KnowledgeBaseProtected = () => {
    const { canAccessKnowledgeBase } = useUserPermissions();
    return (
        <ProtectedRoute permissionCheck={canAccessKnowledgeBase}>
            <KnowledgeBaseView />
        </ProtectedRoute>
    );
};

const DocumentBaseProtected = () => {
    const { canAccessKnowledgeBase } = useUserPermissions();
    return (
        <ProtectedRoute permissionCheck={canAccessKnowledgeBase}>
            <DocumentBase />
        </ProtectedRoute>
    );
};

const DocumentUploadProtected = () => {
    const { canUploadDocuments } = useUserPermissions();
    return (
        <ProtectedRoute permissionCheck={canUploadDocuments}>
            <DocumentsUploadStage />
        </ProtectedRoute>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthenticatedApp>
                <LayoutCustom />
            </AuthenticatedApp>
        ),
        children: [
            { path: '/', element: <Navigate to={routes.chat.name} replace /> },
            { path: BASE_PATH, element: <Navigate to={routes.chat.name} replace /> },
            { path: routes.chat.name, element: <Chat /> },
            { path: routes.loadChat.name, element: <Chat /> },
            { path: routes.home.name, element: <Chat /> },
            { path: routes.documentBase.name, element: <DocumentBaseProtected /> },
            { path: routes.documentUploadStage.name, element: <DocumentUploadProtected /> },
            { path: routes.knowledgeBase.dynamicParams, element: <KnowledgeBaseProtected /> },
            { path: '*', element: <NotFound /> }
        ]
    },
    {
        path: BASE_PATH,
        element: (
            <AuthenticatedApp>
                <Chat />
            </AuthenticatedApp>
        )
    }
]);

export default routes;
