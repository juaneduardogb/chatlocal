import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { Divider, Form } from 'antd';
import { useEffect, useState } from 'react';

import { LoaderState } from './DocDrawer';
import LabelsIAInformation from './LabelsIAInformation';

import SplashErrorUpdateDocument from '@/components/document-drawer/SplashErrorUpdateDocument';
import SplashUpdateDocument from '@/components/document-drawer/SplashUpdateDocument';
import LabelsCustomByAuthor from '@/components/form/LabelsCustomByAuthor';
import LabelsIA from '@/components/form/LabelsIA';
import LineOfServiceDocuments from '@/components/LineOfService';
import OwnerSection from '@/components/OwnerSection';
import SplashLoader from '@/components/SplashLoader';
import SupportSection from '@/components/SupportSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { useAppStore } from '@/store/app';
import { useDocumentFormStore } from '@/store/document/document.store';
import { GenericLabel } from '@/types';
import { Document, DocumentsByUserResponse, TagsElements } from '@/types/documents';
import { parsePersons } from '@/utilities/utils';

type DocumenEditModeProps = {
    document: Document;
    loaderState: LoaderState;
    setLoaderState: React.Dispatch<React.SetStateAction<LoaderState>>;
    setVisibleButtonsDrawer: React.Dispatch<React.SetStateAction<boolean>>;
    refetchKnowledgeBase: (options?: RefetchOptions) => Promise<QueryObserverResult<DocumentsByUserResponse, Error>>;
};

export default function DocumentEditMode({
    document,
    loaderState,
    setLoaderState,
    setVisibleButtonsDrawer,
    refetchKnowledgeBase
}: DocumenEditModeProps) {
    const [form] = Form.useForm();

    const [tagsIA, setTagsIA] = useState<TagsElements[] | null>(document.labels);
    const [tagsByAuthor, setTagsByAuthor] = useState<TagsElements[] | null>(document.tagsByAuthor);

    const [_, setSubLoSSelected] = useState<string>(document.subLoS);
    const [supportLoS, setSupportLoS] = useState<string>(document.losOwner);

    const { updateDocument } = useDocumentFormStore(state => state);
    const { callFromDrawerDocumentHeader } = useDocumentFormStore(state => state);

    const [supportPersons, setSupportPersons] = useState<GenericLabel[]>();
    const { userName } = useAppStore();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const supportPersonsParse = parsePersons(values['supportPersons']);

            setVisibleButtonsDrawer(false);
            setLoaderState({
                loading: true,
                error: false,
                loaderText: 'Actualizando documento...',
                successDelete: false,
                editMode: true
            });

            const response = await updateDocument({
                uniqueProcessID: document.uniqueProcessID,
                documentName: values.documentName,
                summary: values.summary,
                los: values.los,
                profile: values.profile,
                losOwner: values.losOwner,
                subLoS: values.subLoS,
                supportPersons: supportPersonsParse,
                labels: tagsIA || [],
                tagsByAuthor: tagsByAuthor || [],
                contractType: values.contractType,
                typeOfWorkday: values.typeOfWorkday,
                modifiedBy: userName || ''
            });

            setLoaderState({
                ...loaderState,
                loading: false,
                error: !response,
                successDelete: false,
                successUpdate: !!response
            });
        } catch {
            toast({
                title: 'Notificación',
                description: 'Debes completar todos los campos del formulario.',
                duration: 5000,
                variant: 'destructive'
            });
        } finally {
            refetchKnowledgeBase();
        }
    };

    useEffect(() => {
        /**
         * Homologación de la información de owners y support
         * almacenada en la BD con los campos options
         * para el componente select sin perder información
         * del worker.
         */
        const supportPersonsPrevious = document.support.map((worker: { [key: string]: string | number }) => {
            return {
                label: worker['name'].toLocaleString(),
                value: JSON.stringify({
                    name: worker['name'],
                    email: worker['email'],
                    employeeId: worker['employeeId']
                })
            };
        });

        setSupportPersons(supportPersonsPrevious);
    }, []);

    useEffect(() => {
        if (callFromDrawerDocumentHeader) {
            const submitHandler = async () => {
                await handleSubmit();
            };
            submitHandler();
        }
    }, [callFromDrawerDocumentHeader]);

    return loaderState.error ? (
        <SplashErrorUpdateDocument />
    ) : loaderState.successUpdate ? (
        <SplashUpdateDocument />
    ) : loaderState.loading ? (
        <SplashLoader splashText={loaderState.loaderText} />
    ) : (
        !!supportPersons && (
            <Form
                name='editDocument'
                initialValues={{
                    los: document.los,
                    profile: document.profiles,
                    losOwner: document.losOwner,
                    subLoS: document.subLoS,
                    documentName: document.documentName,
                    summary: document.summary,
                    typeOfWorkday: document.typeOfWorkday,
                    contractType: document.contractType,
                    supportPersons: supportPersons
                }}
                autoComplete='off'
                layout='vertical'
                form={form}
                onFinish={handleSubmit}
            >
                <section className='grid gap-y-4 relative'>
                    <p className='font-bold'>Información general del documento</p>
                    <Form.Item
                        name='documentName'
                        rules={[{ required: true, message: 'Este campo es requerido.' }]}
                        label='Nombre del documento'
                    >
                        <Input title='Nombre del documento'></Input>
                    </Form.Item>

                    <Form.Item
                        name='summary'
                        rules={[{ required: true, message: 'Este campo es requerido.' }]}
                        label='Resumen general del contenido'
                    >
                        <Textarea title='Resumen general del contenido' minLength={2} className='min-h-[100px] h-fit'></Textarea>
                    </Form.Item>

                    <Divider className='my-2' />

                    <section className='grid gap-y-6'>
                        <LabelsIA tagsIA={tagsIA} setTagsIA={setTagsIA} />

                        <Divider className='my-1' />

                        <LabelsIAInformation metaData={document.metaData} />
                    </section>

                    <Divider className='my-1' />

                    <LabelsCustomByAuthor tagsByAuthor={tagsByAuthor} setTagsByAuthor={setTagsByAuthor} />

                    <Divider className='my-2' />

                    <LineOfServiceDocuments />

                    <Divider className='m-2 mb-4' />

                    <OwnerSection setSupportLoS={setSupportLoS} supportLoS={supportLoS} form={form} setSubLoSSelected={setSubLoSSelected} />

                    <Divider className='my-2' />

                    <SupportSection form={form} />
                    <Button className='bg-color-text-primary py-4' type='submit' size={'lg'}>
                        Actualizar documento
                    </Button>
                </section>
            </Form>
        )
    );
}
