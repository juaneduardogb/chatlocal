import { Button } from '@heroui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { useState } from 'react';

import { LoaderState } from './DocDrawer';

import { useDocumentFormStore } from '@/store/document/document.store';

interface DocDrawerHeaderProps {
    loaderState: LoaderState;
    setLoaderState: React.Dispatch<React.SetStateAction<LoaderState>>;
    handleDeleteClick: () => void;
    setDocSelectedIsOpen: (value: boolean) => void;
}

export default function DocDrawerHeader({ setLoaderState, loaderState, handleDeleteClick, setDocSelectedIsOpen }: DocDrawerHeaderProps) {
    const [changeHeaderButtons, setChangeHeaderButtons] = useState(false);

    const { callSubmitDrawerDocument } = useDocumentFormStore(state => state);

    return (
        <section className='flex gap-2 flex-wrap'>
            {changeHeaderButtons && (
                <section className='flex gap-2'>
                    <Button variant='bordered' onPress={() => setDocSelectedIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button color='primary' type='button' variant='shadow' onPress={() => callSubmitDrawerDocument(true)} className='px-8'>
                        Actualizar
                    </Button>
                </section>
            )}

            {!changeHeaderButtons && (
                <>
                    <Popover>
                        <PopoverTrigger>
                            <Button color='primary' type='button' variant='bordered'>
                                Eliminar
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='grid gap-y-4 text-xs p-4 '>
                            <p className='text-md font-bold'>¿Confirmar que deseas eliminar el documento?</p>
                            <section className='flex justify-end gap-4'>
                                <Button variant={'ghost'} size={'sm'}>
                                    Cancelar
                                </Button>
                                <Button variant='shadow' color='primary' size={'sm'} onPress={() => handleDeleteClick()}>
                                    Sí, eliminar documento
                                </Button>
                            </section>
                        </PopoverContent>
                    </Popover>

                    <Button
                        color='primary'
                        variant='shadow'
                        onPress={() => {
                            setChangeHeaderButtons(true);
                            setLoaderState({
                                ...loaderState,
                                loading: false,
                                loaderText: 'Actualizando documento...',
                                editMode: true
                            });
                        }}
                    >
                        Editar
                    </Button>
                </>
            )}
        </section>
    );
}
