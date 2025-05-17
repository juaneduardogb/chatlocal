import { Button, Divider, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import { useInstance } from 'package_entra_id';

const InactivityModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const counting = useRef(false);

    const instance = useInstance();

    const account = instance.getActiveAccount();

    const handleOk = () => {
        counting.current = false;
        setIsModalOpen(false);
    };

    const handleLogout = () => {
        counting.current &&
            instance
                .logout({
                    account: account
                })
                .catch(error => console.log('error', error));
    };

    useEffect(() => {
        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                const sw = registrations.find(registration => registration.scope.includes('/inactividad/'));

                if (sw) {
                    sw.addEventListener('message', event => {
                        if (
                            // @ts-expect-error
                            event.data.type === 'INACTIVITY_DETECTED' &&
                            !counting.current &&
                            account &&
                            countdown === 60
                        ) {
                            setIsModalOpen(true);
                            startCountdown();
                        }
                    });
                }
            });
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'INACTIVITY_DETECTED' && !counting.current && account && countdown === 60) {
                    setIsModalOpen(true);
                    startCountdown();
                } else if (event.data.type === 'LOG') {
                }
            });
        }
    }, []);

    const startCountdown = () => {
        counting.current = true;
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);

                    counting.current &&
                        instance
                            .logout({
                                account: account
                            })
                            .catch(error => console.log('error', error));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <>
            <Modal
                title='Cierre de sesión por inactividad'
                open={isModalOpen}
                footer={() => {
                    return (
                        <div className='flex justify-end gap-5'>
                            <Button onClick={() => handleLogout()} className='w-36'>
                                Cerrar sesión
                            </Button>
                            <Button onClick={() => handleOk()} type='primary' className='w-36'>
                                Mantener sesión
                            </Button>
                        </div>
                    );
                }}
                onClose={() => {}}
                destroyOnClose={true}
                closable={false}
                cancelText={'Cerrar sesión'}
                okText={'Mantener sesión'}
                centered
            >
                <Divider className='my-0'></Divider>
                <p className='mt-4 mb-6'>
                    Si no confirmas mantener la sesión activa, se cerrará automaticamente dentro de {countdown} segundos
                </p>
            </Modal>
        </>
    );
};

export default InactivityModal;
