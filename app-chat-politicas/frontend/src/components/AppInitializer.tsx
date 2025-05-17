import { ReactNode, Suspense, useCallback, useEffect, useState } from 'react';

import { Button } from '@heroui/button';
import ChatLoaderScreen from './Chat/ChatLoaderScreen';
import Disclaimer from './Disclaimer';
import axios from 'axios';
import { logo, logoWhite } from '@/constants/generics';
import { message } from 'antd';
import { useAppStore } from '@/store/app';
import { useInstance } from 'package_entra_id';
import { useTheme } from 'next-themes';

interface AppInitializerProps {
    children: ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
    const { theme } = useTheme();

    const instance = useInstance();

    const {
        apiUrl,
        setTermsAccepted,
        setTermsAcceptanceDate,
        setRequestsCount,
        setMaxRequests,
        isAppConfigLoaded,
        setIsAppConfigLoaded,
        termsAccepted,
        setUserEmail,
        setUserName,
        setToken,
        token
    } = useAppStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [configLoadAttempted, setConfigLoadAttempted] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Configurar axios para incluir el token JWT en todas las solicitudes
    useEffect(() => {
        if (token) {
            // Configurar interceptor para agregar el token a todas las solicitudes
            const requestInterceptor = axios.interceptors.request.use(
                config => {
                    // Solo agregar el token para rutas específicas (documents, knowledge-base, chat y utilities)
                    const url = config.url || '';
                    if (
                        url.includes('/documents') ||
                        url.includes('/knowledge-base') ||
                        url.includes('/chat') ||
                        url.includes('/utilities')
                    ) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                error => {
                    return Promise.reject(error);
                }
            );

            // Configurar interceptor para manejar errores de respuesta
            const responseInterceptor = axios.interceptors.response.use(
                response => response,
                async error => {
                    const originalRequest = error.config;
                    const url = originalRequest.url || '';

                    // Evitar reintento para el endpoint /user/actions (para prevenir bucles infinitos)
                    if (url.includes('/app-config/user/actions')) {
                        return Promise.reject(error);
                    }

                    // Verificar si es un error 403 con mensaje específico de token inválido
                    if (
                        error.response &&
                        error.response.status === 403 &&
                        error.response.data.detail === 'TOKEN_INVALID_OR_EXPIRED' &&
                        !originalRequest._retry
                    ) {
                        originalRequest._retry = true;

                        try {
                            // Obtener el email del usuario actual
                            const { userEmail } = useAppStore.getState();

                            if (!userEmail) {
                                throw new Error('No se pudo identificar el usuario');
                            }

                            console.log('Token expirado o inválido. Iniciando nueva sesión...');

                            // Intentar iniciar sesión de nuevo
                            const loginResponse = await axios.post(`${apiUrl}/app-config/login`, {
                                workEmail: userEmail
                            });

                            const newToken = loginResponse.data.token;

                            // Guardar el nuevo token
                            setToken(newToken);

                            // Actualizar el token en la solicitud original
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;

                            console.log('Sesión renovada correctamente. Reintentando solicitud original...');

                            // Reintentar la solicitud original
                            return axios(originalRequest);
                        } catch (refreshError) {
                            console.error('Error al renovar la sesión:', refreshError);
                            // Si falla la revalidación, mostrar un mensaje y redirigir al usuario
                            message.error('Tu sesión ha expirado. Por favor, recarga la página para iniciar sesión de nuevo.');
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 2000);
                            return Promise.reject(refreshError);
                        }
                    }

                    return Promise.reject(error);
                }
            );

            // Limpiar los interceptores cuando el componente se desmonta o el token cambia
            return () => {
                axios.interceptors.request.eject(requestInterceptor);
                axios.interceptors.response.eject(responseInterceptor);
            };
        }
    }, [token, apiUrl, setToken]);

    // Función para manejar la transición suave - optimizada para reducir re-renders
    const handleTransition = useCallback((nextContent: () => void) => {
        // Usar un setTimeout para batching implicito de las actualizaciones de estado
        setTimeout(() => {
            setFadeOut(true);
            setIsLoading(false);
            nextContent();
            setShowContent(true);
        }, 0);
    }, []);

    useEffect(() => {
        // Flag para controlar si el efecto aún está activo (evitar actualizaciones después de desmontar)
        let isActive = true;

        const account = instance.getActiveAccount();
        const userEmail = account?.username;

        if (isActive) {
            setUserEmail(userEmail || '');
            setUserName(account?.name || '');
        }

        // Si no hay email de usuario pero ya intentamos cargar la configuración, mantener la pantalla de carga
        if (!userEmail && configLoadAttempted) {
            return;
        }

        // Si no hay email de usuario y es la primera vez, esperar
        if (!userEmail && !configLoadAttempted) {
            // No mostrar error inmediatamente, dar tiempo a que se cargue el email
            console.log('Esperando que el userEmail esté disponible...');
            return;
        }

        // Si ya se cargó la configuración, no cargarla de nuevo
        if (isAppConfigLoaded) {
            if (isActive) {
                // Solo transicionar si no hay un error y si los términos ya fueron aceptados
                handleTransition(() => {});
            }
            return;
        }

        // Usamos un flag para prevenir múltiples llamadas
        let isLoading = false;

        const loadAppConfig = async () => {
            // Prevenir múltiples llamadas concurrentes
            if (isLoading || !isActive) {
                return;
            }

            isLoading = true;
            if (isActive) {
                setConfigLoadAttempted(true);
            }

            try {
                console.log(`Cargando configuración para usuario: ${userEmail}`);
                console.log(`URL de API: ${apiUrl}`);

                // Obtener la configuración de la aplicación
                const response = await axios.get(`${apiUrl}/app-config/config`, {
                    params: { user_email: userEmail }
                });

                if (!isActive) {
                    return;
                } // No continuar si el componente se desmontó

                console.log('Respuesta de configuración:', response.data);

                const {
                    terms_accepted,
                    terms_acceptance_date,
                    requests_last_24_hours,
                    max_requests_per_ip,
                    token: authToken
                } = response.data;

                // Actualizar el store con la información recibida - en un mismo batch
                if (isActive) {
                    // Usar setTimeout para agrupar todas las actualizaciones de estado
                    setTimeout(() => {
                        if (!isActive) {
                            return;
                        }

                        setTermsAccepted(terms_accepted);
                        if (terms_acceptance_date) {
                            setTermsAcceptanceDate(terms_acceptance_date);
                        }
                        setRequestsCount(requests_last_24_hours);
                        setMaxRequests(max_requests_per_ip);

                        // Guardar el token JWT si está presente
                        if (authToken) {
                            setToken(authToken);
                            console.log('Token JWT almacenado correctamente');
                        } else {
                            console.warn('No se recibió token JWT en la respuesta');
                        }

                        setIsAppConfigLoaded(true);

                        // Realizar la transición sin esperas adicionales
                        handleTransition(() => {});
                    }, 0);
                }

                isLoading = false;
            } catch (error) {
                if (!isActive) {
                    return;
                } // No continuar si el componente se desmontó

                console.error('Error al cargar la configuración de la aplicación:', error);

                // Agrupar las actualizaciones de estado
                setTimeout(() => {
                    if (!isActive) {
                        return;
                    }

                    setError('Error al cargar la configuración. Por favor, recarga la página.');
                    isLoading = false;

                    // Mostrar el error sin esperas adicionales
                    handleTransition(() => {});
                }, 0);
            }
        };

        // Si tenemos el email del usuario y no hemos cargado la configuración, hacerlo ahora
        if (userEmail && !isAppConfigLoaded) {
            loadAppConfig();
        }

        // Cleanup para evitar llamadas innecesarias y actualizaciones en desmontaje
        return () => {
            isActive = false;
            isLoading = false;
        };
    }, [
        apiUrl,
        setTermsAccepted,
        setTermsAcceptanceDate,
        setRequestsCount,
        setMaxRequests,
        setIsAppConfigLoaded,
        isAppConfigLoaded,
        setUserEmail,
        setUserName,
        instance,
        setToken,
        configLoadAttempted,
        handleTransition
    ]);

    // Componente de carga con logo y animación
    const LoaderComponent = () => (
        <div
            className={`fixed inset-0 flex flex-col items-center justify-center bg-background z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className='flex flex-col items-center gap-y-8'>
                <img alt='Logo' src={theme === 'dark' ? logoWhite : logo} className='w-32 h-32 animate-pulse' />
                <ChatLoaderScreen />
            </div>
        </div>
    );

    // Mostrar error si ocurrió alguno
    const ErrorComponent = () => (
        <div
            className={`bg-background flex items-center justify-center h-screen transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-lg'>
                <div className='flex items-center mb-3'>
                    <svg
                        className='w-6 h-6 mr-2 text-red-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        ></path>
                    </svg>
                    <strong className='font-bold text-lg'>Error: </strong>
                </div>
                <span className='block'>{error}</span>
                <div className='mt-4 text-right'>
                    <Button color='primary' onPress={() => window.location.reload()} className='text-white'>
                        Reintentar
                    </Button>
                </div>
            </div>
        </div>
    );

    // Mientras está cargando, mostrar el loader
    if (isLoading) {
        return <LoaderComponent />;
    }

    // Mostrar error si ocurrió alguno
    if (error) {
        return (
            <>
                <Suspense fallback={<LoaderComponent />}>
                    <ErrorComponent />
                </Suspense>
            </>
        );
    }

    // Si la configuración está cargada pero no se han aceptado los términos, mostrar el disclaimer
    if (isAppConfigLoaded && !termsAccepted) {
        return (
            <>
                <Suspense fallback={<LoaderComponent />}>
                    <div className={'bg-background transition-all duration-500'}>
                        <Disclaimer />
                    </div>
                </Suspense>
            </>
        );
    }

    // Si la configuración está cargada y se han aceptado los términos, mostrar el contenido de la aplicación
    if (isAppConfigLoaded && termsAccepted) {
        return (
            <>
                <Suspense fallback={<LoaderComponent />}>
                    <div className={'bg-background transition-all duration-500'}>{children}</div>
                </Suspense>
            </>
        );
    }

    // Caso por defecto: seguir mostrando el loader
    return <LoaderComponent />;
}
