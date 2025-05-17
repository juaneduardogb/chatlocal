import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useWindowSize } from '@uidotdev/usehooks';
import { Divider, Modal } from 'antd';
import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DocumentStatusSelector from '../DocumentBase/components/DocumentStatus';
import HeaderDocument, { ButtonCallToAction } from '../DocumentBase/components/header/HeaderDocument';

import ErrorOnDelete from '@/components/form/ErrorOnDelete';
import LoadingSpin from '@/components/form/LoadingSpin';
import SuccessDelete from '@/components/form/SuccessDelete';
import CustomProgress from '@/components/ui/CustomProgress';
import { ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import routes from '@/constants/routes';
import { useDocumentCreate, useDocumentUpdate } from '@/hooks/useDocuments';
import { useExtractContent } from '@/hooks/useExtractContent';
import { useDeleteKnowledgeBase, useKnowledgeBaseCreate } from '@/hooks/useKnowledgeBase';
import { toast } from '@/hooks/useToast';
import { useDocumentFormStore } from '@/store/document/document.store';
import { ExtractTextFromDocumentResponse, KnowledgeBase } from '@/types/documents';

export default function DocumentsUploadStage() {
    const navigate = useNavigate();

    const size = useWindowSize();

    // Para prevenir que se llame más de una vez a la creación de base de conocimiento.
    const knowledgeIsCreated = useRef(false);

    const [percentageProgress, setPercentageProgress] = useState(1);
    const [cancelDocumentsUpload, setCancelDocumentsUpload] = useState(false);

    // Indicador para saber si el usuario confirmó la cancelación del proceso.
    const [confirmCancelProcess, setConfirmCancelProcess] = useState(false);

    const [knowledgeIsDeleted, setKnowledgeIsDeleted] = useState<boolean | null>(null);

    const [knowledgeBaseCreated, setKnowledgeBaseCreated] = useState<KnowledgeBase | null>(null);
    const {
        submitKnowledgeBaseAndDocument,
        deleteKnowledgeBase,
        extractContentFromFiles,
        createDocument,
        toastMessage,
        name,
        description,
        files,
        los,
        labels,
        profiles,
        support,
        tagsByAuthor,
        subLoS,
        losOwner,
        typeOfWorkday,
        contractType
    } = useDocumentFormStore(state => state);

    const [fileRow, setFileRow] = useState<ExtractTextFromDocumentResponse[]>([]);

    const [btnCallToActionInfo, setBtnCallToActionInfo] = useState<ButtonCallToAction[]>();

    // Obtener todos los hooks de mutación necesarios
    const knowledgeBaseCreateMutation = useKnowledgeBaseCreate();
    const deleteKnowledgeBaseMutation = useDeleteKnowledgeBase();
    const extractContentMutation = useExtractContent();
    const documentCreateMutation = useDocumentCreate();
    const documentUpdateMutation = useDocumentUpdate();

    const handleDeleteKnowledge = async () => {
        if (knowledgeBaseCreated?.knowledgeId) {
            setConfirmCancelProcess(true);
            const response = await deleteKnowledgeBase(knowledgeBaseCreated.knowledgeId, deleteKnowledgeBaseMutation.mutateAsync);
            if (response) {
                setKnowledgeIsDeleted(true);
                setTimeout(() => {
                    setConfirmCancelProcess(false);
                    setCancelDocumentsUpload(false);
                }, 3000);
            } else {
                setKnowledgeIsDeleted(false);
                setTimeout(() => {
                    setConfirmCancelProcess(false);
                    setKnowledgeIsDeleted(null);
                }, 3000);
            }
        }
    };

    const calculateProgress = () => {
        if (!!files) {
            // Evitar división por cero
            if (files?.length === 0) {
                return 1;
            }

            const totalPercentage = Math.round((fileRow.length / files.length) * 100);
            setPercentageProgress(totalPercentage);
        }
    };

    // Procesamiento en batch para obtener el contenido de los documentos.
    const batchContentDocuments = async (knowledgeBaseCreated: KnowledgeBase) => {
        if (!files) {
            return;
        }

        for (const file of files) {
            try {
                const response = await extractContentFromFiles(file, extractContentMutation.mutateAsync);

                if (!!response) {
                    const documentInformation = await createDocument(
                        {
                            documentName: response.documentName,
                            los: los || [],
                            labels: labels || [],
                            support: support || [],
                            statuses: {
                                labels: {
                                    confirmation: false,
                                    date: null,
                                    person: null
                                },
                                access: {
                                    confirmation: false,
                                    date: null,
                                    person: null
                                },
                                owners: {
                                    confirmation: false,
                                    date: null,
                                    person: null
                                },
                                support: {
                                    confirmation: false,
                                    date: null,
                                    person: null
                                },
                                publish: {
                                    confirmation: false,
                                    date: null,
                                    person: null
                                }
                            },
                            profiles: profiles || [],
                            knowledgeBase: knowledgeBaseCreated,
                            sizeFormatted: response.sizeFormatted,
                            size: response.size,
                            documentUrl: response.documentUrl || '',
                            typeOfWorkday: typeOfWorkday || [],
                            contractType: contractType || [],
                            documentUniqueName: response.documentUniqueName || '',
                            content: response.documentContent || '',
                            tagsByAuthor: tagsByAuthor || [],
                            subLoS: subLoS || '',
                            losOwner: losOwner || ''
                        },
                        documentCreateMutation.mutateAsync
                    );

                    if (!!documentInformation) {
                        setFileRow(prevState => [...prevState, response]);
                    }
                }
            } catch (error) {
                console.error('Error processing file:', file.name, error);
            }
        }
    };

    useEffect(() => {
        if (knowledgeIsCreated.current === false) {
            const fetchData = async () => {
                try {
                    const response = await submitKnowledgeBaseAndDocument(knowledgeBaseCreateMutation.mutateAsync);
                    if (response) {
                        setKnowledgeBaseCreated(response);
                        await batchContentDocuments(response);
                    } else {
                        console.error('Failed to submit Knowledge Base');
                    }
                } catch (error) {
                    console.error('Error in fetchData:', error);
                }
            };
            fetchData();
            knowledgeIsCreated.current = true;
        }
    }, [knowledgeBaseCreateMutation.mutateAsync]);

    useEffect(() => {
        if (!!files) {
            calculateProgress();
        }
        if (toastMessage) {
            toast({
                title: toastMessage.title,
                description: toastMessage.description,
                variant: toastMessage.variant,
                duration: toastMessage.duration
            });
        }
    }, [toastMessage, fileRow]);

    useEffect(() => {
        if (knowledgeIsDeleted !== true && knowledgeBaseCreated) {
            setBtnCallToActionInfo([
                {
                    title: 'Cancelar carga',
                    onClick: () => {
                        setCancelDocumentsUpload(true);
                    },
                    className: 'border text-primary hover:bg-black/5 p-0 m-0 px-4 bg-transparent'
                },
                {
                    title: 'Revisar Documentos',
                    onClick: () => {
                        navigate(`${routes.knowledgeBase.name}/${knowledgeBaseCreated.knowledgeId}`);
                    },
                    disabled: percentageProgress < 100
                }
            ]);
        } else {
            setBtnCallToActionInfo(undefined);
        }
    }, [knowledgeIsDeleted, knowledgeBaseCreated, percentageProgress]);

    return (
        <main className={`!max-w-6xl w-full p-4 h-fit mx-auto ${(size.width ?? 0) <= 1360 && 'md:pl-[120px]'}`}>
            <ScrollArea className='grid h-fit gap-y-8 h-fit'>
                {cancelDocumentsUpload && (
                    <Modal
                        open={cancelDocumentsUpload}
                        footer={null}
                        centered
                        title='Cancelar proceso masivo'
                        className='md:!w-[600px] xs:!w-[300px]'
                        onOk={() => setCancelDocumentsUpload(false)}
                        onCancel={() => setCancelDocumentsUpload(false)}
                        onClose={() => setCancelDocumentsUpload(false)}
                        maskClosable={false}
                        closable={!confirmCancelProcess}
                    >
                        <section className='relative'>
                            {confirmCancelProcess && knowledgeIsDeleted === null && <LoadingSpin />}
                            {confirmCancelProcess && knowledgeIsDeleted && <SuccessDelete />}
                            {confirmCancelProcess && knowledgeIsDeleted === false && <ErrorOnDelete />}
                            <main className={confirmCancelProcess ? 'blur-3xl select-none' : ''}>
                                <section className='bg-warning flex items-center gap-2 p-4'>
                                    <Info /> Al cancelar el proceso todos los documentos cargados serán eliminados.
                                </section>
                                <Divider />

                                <section className='grid gap-y-8'>
                                    <p className='text-lg text-center font-bold'>¿Aceptas cancelar el proceso y todo lo que conlleva?</p>
                                    <div className='flex  justify-center gap-4'>
                                        <Button
                                            variant='ghost'
                                            disabled={confirmCancelProcess}
                                            onClick={() => setCancelDocumentsUpload(false)}
                                        >
                                            No
                                        </Button>
                                        <Button
                                            color='primary'
                                            type='button'
                                            variant='bordered'
                                            onPress={async () => {
                                                await handleDeleteKnowledge();
                                            }}
                                            disabled={confirmCancelProcess}
                                        >
                                            Cancelar proceso masivo
                                        </Button>
                                    </div>
                                </section>
                            </main>
                        </section>
                    </Modal>
                )}

                <HeaderDocument headerTitle='Carga de base de conocimiento' buttonsCallToAction={btnCallToActionInfo} />
                <Card className='h-fit pb-4'>
                    <CardHeader title='Información general de la base de conocimiento' className='text-foreground'>
                        Información general de la base de conocimiento
                    </CardHeader>
                    <CardBody>
                        <div className='text-md text-wrap'>
                            <span className='font-medium'>Nombre de base de conocimiento: </span>
                            {name}
                        </div>
                        <div className='text-xs text-wrap'>
                            <span className='font-medium'>Descripción: </span>
                            {description}
                        </div>
                    </CardBody>
                </Card>
                <Card className='h-fit pb-4'>
                    <CardHeader title='Resumen general de carga' className='text-foreground'>
                        Resumen general de carga
                    </CardHeader>
                    <CardBody className='text-xs pb-8'>
                        {/* Loading section */}
                        <section className='flex gap-2 mb-2'>
                            <span className='font-bold'>Avance:</span>
                            {fileRow.length} de {files?.length} documentos procesados
                        </section>
                        <CustomProgress value={percentageProgress} />
                    </CardBody>
                </Card>
                <Card className='h-fit pb-4'>
                    <CardHeader title='Carga de documentos' />
                    <CardBody
                        style={{
                            maxHeight: '40vh',
                            overflowY: 'auto'
                        }}
                    >
                        <Table className='relative !max-h-[200px]'>
                            <TableHeader className='bg-container_menu'>
                                <TableRow className='hover:!bg-container_menu'>
                                    <TableCell className='text-foreground'>Nombre del documento</TableCell>
                                    <TableCell className='text-foreground'>Peso doc.</TableCell>
                                    <TableCell className='text-foreground'>Estado de carga</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className='cursor-not-allowed relative text-foreground'>
                                {fileRow.map(row => (
                                    <TableRow className='text-foreground'>
                                        <TableCell className='truncate text-ellipsis text-foreground'>{row.documentName}</TableCell>
                                        <TableCell>{row.sizeFormatted}</TableCell>
                                        <TableCell width={200}>
                                            {row.documentContent !== null ? (
                                                <DocumentStatusSelector statusName='Procesado' />
                                            ) : (
                                                <DocumentStatusSelector statusName='Error de proceso' />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <div className='absolute top-0 left-0 w-full h-full bg-background/70 flex align-middle justify-center !z-[90] cursor-not-allowed'></div>
                        </Table>
                    </CardBody>
                </Card>
                <ScrollBar orientation='vertical'></ScrollBar>
            </ScrollArea>
        </main>
    );
}
