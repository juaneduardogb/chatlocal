import { Button, Input } from '@heroui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    setTitle: (title: string) => void;
    onRename: () => void;
    isLoading: boolean;
}

// Minimum title length required
const MIN_TITLE_LENGTH = 3;

export const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, title, setTitle, onRename, isLoading }) => {
    // Guardar el overflow original y la posición del scroll
    const prevBodyStyle = useRef<string>('');
    const scrollPos = useRef<number>(0);
    const [error, setError] = useState<string | null>(null);

    // Validate title when it changes
    useEffect(() => {
        if (title.trim().length > 0 && title.trim().length < MIN_TITLE_LENGTH) {
            setError(`El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`);
        } else {
            setError(null);
        }
    }, [title]);

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
        >
            <div
                style={{
                    borderRadius: '8px',
                    padding: '20px',
                    width: '400px',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflow: 'auto',
                    zIndex: 2147483647
                }}
                className='bg-background text-foreground'
            >
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold'>Renombrar chat</h2>
                    <button onClick={onClose} className='text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'>
                        ✕
                    </button>
                </div>

                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Título del chat</label>
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder='Ingresa un nuevo título'
                        className='w-full'
                        isInvalid={!!error}
                        errorMessage={error || ''}
                    />
                </div>

                <div className='flex justify-end gap-2 mt-4'>
                    <Button variant='flat' onPress={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color='primary'
                        onPress={onRename}
                        disabled={isLoading || title.trim().length < MIN_TITLE_LENGTH}
                        isLoading={isLoading}
                    >
                        Guardar
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
