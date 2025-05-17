import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { Drawer } from 'antd';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import DocDrawerHeader from './DocDrawerHeader';
import DocumentEditMode from './DocEditMode';
import DocumentViewMode from './DocViewMode';

import { useDeleteDocument } from '@/hooks/useDocuments';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';
import { DocumentsByUserResponse } from '@/types/documents';

interface DocumentDrawerProps {
    docSelectedIsOpen: boolean;
    setDocSelectedIsOpen: (value: boolean) => void;
    refetchKnowledgeBase: (options?: RefetchOptions) => Promise<QueryObserverResult<DocumentsByUserResponse, Error>>;
}

export interface LoaderState {
    loading: boolean;
    loaderText: string;
    error: boolean;
    successDelete: boolean;
    editMode: boolean;
    successUpdate?: boolean;
}

const defaultLoaderText = 'Consultando información...';

const loaderErrorState = { loading: false, error: true, loaderText: defaultLoaderText, successDelete: false, editMode: false };
const loaderSuccessState = { loading: false, error: false, loaderText: defaultLoaderText, successDelete: true, editMode: false };
const loaderLoadingState = {
    loading: true,
    loaderText: 'Eliminando documento...',
    error: false,
    successDelete: false,
    editMode: false
};

export default function DocumentDrawer({ docSelectedIsOpen, setDocSelectedIsOpen, refetchKnowledgeBase }: DocumentDrawerProps) {
    const { docSelected } = useKnowledgeBaseStore(state => state);

    const [loaderState, setLoaderState] = useState<LoaderState>({
        loading: false,
        loaderText: defaultLoaderText,
        error: false,
        successDelete: false,
        editMode: false
    });

    // Estado que permite visualizar los botones del header dentro del drawer
    const [visibleButtonsDrawer, setVisibleButtonsDrawer] = useState<boolean>(true);

    // Utilizando la mutación para eliminar documentos
    const deleteDocumentMutation = useDeleteDocument();

    const handleDeleteClick = () => {
        setVisibleButtonsDrawer(false);
        if (docSelected?.uniqueProcessID) {
            setLoaderState(loaderLoadingState);
            // Ejecutar la mutación para eliminar el documento
            deleteDocumentMutation.mutate(docSelected.uniqueProcessID);
        }
    };

    useEffect(() => {
        if (deleteDocumentMutation.isError) {
            setLoaderState(loaderErrorState);
        } else if (deleteDocumentMutation.isSuccess) {
            setLoaderState(loaderSuccessState);
            refetchKnowledgeBase();
        }
    }, [deleteDocumentMutation.isPending, deleteDocumentMutation.isError, deleteDocumentMutation.isSuccess]);

    useEffect(() => {
        // Dejar valores por defecto cuando se visualiza el drawer (mount component)
        setLoaderState({
            loading: false,
            loaderText: defaultLoaderText,
            error: false,
            successDelete: false,
            editMode: false,
            successUpdate: false
        });
        setVisibleButtonsDrawer(true);
    }, []);

    return (
        <Drawer
            placement={'right'}
            closable={!loaderState.loading}
            onClose={() => setDocSelectedIsOpen(false)}
            key={'DrawerDocumentInKnowledgeBase'}
            open={docSelectedIsOpen}
            width={900}
            maskClosable={false}
            destroyOnClose={true}
            className='!bg-background !text-foreground'
            closeIcon={<X className='text-foreground' />}
            title={
                <header className='flex justify-between gap-2 items-center'>
                    <h2 className={`text-wrap ${visibleButtonsDrawer && 'max-w-[40rem] px-2'}`}>{docSelected?.documentName}</h2>
                    <div className='flex justify-between items-center relative'>
                        {visibleButtonsDrawer && (
                            <DocDrawerHeader
                                setLoaderState={setLoaderState}
                                loaderState={loaderState}
                                handleDeleteClick={handleDeleteClick}
                                setDocSelectedIsOpen={setDocSelectedIsOpen}
                            />
                        )}
                    </div>
                </header>
            }
        >
            <div className='relative'>
                {docSelected && loaderState.editMode === false && <DocumentViewMode document={docSelected} loaderState={loaderState} />}
                {docSelected && loaderState.editMode && (
                    <DocumentEditMode
                        document={docSelected}
                        loaderState={loaderState}
                        setLoaderState={setLoaderState}
                        setVisibleButtonsDrawer={setVisibleButtonsDrawer}
                        refetchKnowledgeBase={refetchKnowledgeBase}
                    />
                )}
            </div>
        </Drawer>
    );
}
