import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HeroUIProvider } from '@heroui/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react';
import { ToastProvider } from '@heroui/toast';
import { createRoot } from 'react-dom/client';
import { router } from './constants/routes.tsx';
import { useAuthProvider } from 'package_entra_id';

const queryClient = new QueryClient();

const { AuthProvider } = useAuthProvider();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HeroUIProvider>
            <NextThemesProvider attribute='class'>
                <ToastProvider maxVisibleToasts={3} />
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </AuthProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    </StrictMode>
);
