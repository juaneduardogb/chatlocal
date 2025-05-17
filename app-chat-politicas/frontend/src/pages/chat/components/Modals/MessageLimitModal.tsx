import { Button } from '@heroui/react';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

import routes from '@/constants/routes';
import { generateChatId } from '@/store/chat/chat.store';

interface MessageLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MessageLimitModal: React.FC<MessageLimitModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Guardar el overflow original y la posición del scroll
    const prevBodyStyle = useRef<string>('');
    const scrollPos = useRef<number>(0);

    // Manejar el scroll del body cuando el modal está abierto/cerrado
    useEffect(() => {
        if (isOpen) {
            // Guardar valores actuales antes de modificarlos
            scrollPos.current = window.scrollY;
            prevBodyStyle.current = document.body.style.overflow;

            // Prevenir scroll en el body, pero mantener su posición
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPos.current}px`;
            document.body.style.width = '100%';
        } else if (prevBodyStyle.current !== '') {
            // Restaurar el estado original
            document.body.style.overflow = prevBodyStyle.current;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollPos.current);
        }

        return () => {
            // Limpiar al desmontar
            document.body.style.overflow = prevBodyStyle.current;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            if (scrollPos.current > 0) {
                window.scrollTo(0, scrollPos.current);
            }
        };
    }, [isOpen]);

    const handleCreateNewChat = () => {
        const newChatId = generateChatId();
        onClose();
        navigate(routes.loadChat.create(newChatId));
    };

    if (!isOpen) {
        return null;
    }

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2147483647 // Máximo z-index posible
            }}
            onClick={onClose}
        >
            <div
                style={{
                    borderRadius: '8px',
                    padding: '20px',
                    width: '500px',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflow: 'auto',
                    zIndex: 2147483647
                }}
                onClick={e => e.stopPropagation()}
                className='bg-background'
            >
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold'>Límite de mensajes alcanzado</h2>
                    <button onClick={onClose} className='text-foreground'>
                        ✕
                    </button>
                </div>

                <div className='mb-4'>
                    <p>Has alcanzado el límite máximo de 20 mensajes para este chat.</p>
                    <p className='mt-2'>Para continuar la conversación, te recomendamos crear un nuevo chat.</p>
                </div>

                <div className='flex justify-end gap-2 mt-4'>
                    <Button variant='bordered' onPress={onClose} className='bg-background '>
                        Cerrar
                    </Button>
                    <Button color='primary' onPress={handleCreateNewChat}>
                        Crear nuevo chat
                    </Button>
                </div>
            </div>
        </div>
    );

    // Crear un div fijo para el portal del modal
    // Esto evita problemas de desplazamiento al renderizar directamente en el body
    const portalTarget = document.getElementById('modal-root') || document.body;

    // Usar createPortal para renderizar el modal en el nivel más alto del DOM
    return ReactDOM.createPortal(modalContent, portalTarget);
};
