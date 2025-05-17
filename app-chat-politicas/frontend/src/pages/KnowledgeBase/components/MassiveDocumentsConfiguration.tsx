import { Button } from '@heroui/button';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';
import { Divider, Form, Modal } from 'antd';
import { ArrowRightIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import DisclaimerSection from '@/components/DisclaimerSection';
import ErrorOnMassiveConf from '@/components/form/ErrorOnMassiveConf';
import LoadingSpin from '@/components/form/LoadingSpin';
import LineOfServiceDocuments from '@/components/LineOfService';
import OwnerSection from '@/components/OwnerSection';
import SupportSection from '@/components/SupportSection';
import { useKnowledgeMassiveConfiguration } from '@/hooks/useKnowledgeBase';
import { toast } from '@/hooks/useToast';
import { DocumentResponse } from '@/models/documents';
import { useAppStore } from '@/store/app';
import { GenericLabel } from '@/types';
import { KnowledgeBase } from '@/types/documents';
import { Document } from '@/types/documents';
import { parsePersons } from '@/utilities/utils';

interface IMassiveDocumentsConfiguration {
    massiveDocumentsIsOpen: boolean;
    setMassiveConfigurationIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    documents: Row<Document>[];
    setRowSelection: React.Dispatch<React.SetStateAction<{}>>;
    knowledgeBase: KnowledgeBase | null;
    refetchKnowledgeBase: (options?: RefetchOptions) => Promise<QueryObserverResult<DocumentResponse, Error>>;
}

export default function MassiveDocumentsConfiguration({
    massiveDocumentsIsOpen,
    setMassiveConfigurationIsOpen,
    documents,
    setRowSelection,
    knowledgeBase,
    refetchKnowledgeBase
}: IMassiveDocumentsConfiguration) {
    const [form] = Form.useForm();

    const [_, setSubLoSSelected] = useState<string>(knowledgeBase?.subLoS ?? '');
    const [supportLoS, setSupportLoS] = useState<string>(knowledgeBase?.losOwner ?? '');

    const [loadingModal, setLoadingModal] = useState<boolean>(false);
    const [errorModal, setErrorModal] = useState<boolean>(false);

    const [supportPersons, setSupportPersons] = useState<GenericLabel[]>();
    const { userName } = useAppStore();

    const massiveConfigurationMutation = useKnowledgeMassiveConfiguration();

    const handleSubmit = async () => {
        try {
            const allDocumentsIds = documents.map(document => document.original.uniqueProcessID);
            const values = await form.validateFields();
            setLoadingModal(true);

            const supportPersonsParse = parsePersons(values['supportPersons']);

            await massiveConfigurationMutation.mutateAsync({
                knowledgeId: knowledgeBase?.knowledgeId || '',
                los: values['los'],
                profiles: values['profile'],
                losOwner: values['losOwner'],
                subLoS: values['subLoS'],
                support: supportPersonsParse,
                modifiedBy: userName || '',
                typeOfWorkday: values['typeOfWorkday'],
                contractType: values['contractType'],
                allDocumentsIds: allDocumentsIds
            });

            setMassiveConfigurationIsOpen(false);
            toast({
                title: '¡Notificación!',
                description: 'Se han revisado correctamente los archivos de manera masiva.',
                variant: 'success',
                duration: 5000
            });
            setRowSelection({});
        } catch (error) {
            console.error(error);
            handleErrorMassive();
        } finally {
            setLoadingModal(false);
            refetchKnowledgeBase();
        }
    };

    const handleErrorMassive = () => {
        setErrorModal(true);
        toast({
            title: '¡Notificación!',
            description: 'Ha ocurrido un problema al intentar realizar la configuración masiva.',
            variant: 'destructive',
            duration: 5000
        });
    };

    useEffect(() => {
        /**
         * Homologación de la información de owners y support
         * almacenada en la BD con los campos options
         * para el componente select sin perder información
         * del worker.
         */

        const supportPersonsPrevious = knowledgeBase?.support.map((worker: { [key: string]: string | number }) => {
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
        form.setFieldsValue({
            supportPersons: supportPersonsPrevious
        });
    }, []);

    return (
        <Modal
            centered
            title={`Configuración de documentos: ${documents.length}`}
            open={massiveDocumentsIsOpen}
            onOk={() => setMassiveConfigurationIsOpen(false)}
            onCancel={() => setMassiveConfigurationIsOpen(false)}
            className='min-w-[50vw] text-xs relative'
            footer={null}
            closable={!loadingModal}
            maskClosable={false}
        >
            <Form
                form={form}
                className='overflow-y-auto px-4 pb-20 max-h-[70vh]'
                initialValues={{
                    los: knowledgeBase?.los,
                    profile: knowledgeBase?.profiles,
                    losOwner: knowledgeBase?.losOwner,
                    subLoS: knowledgeBase?.subLoS,
                    typeOfWorkday: knowledgeBase?.typeOfWorkday,
                    contractType: knowledgeBase?.contractType,
                    supportPersons: supportPersons
                }}
            >
                <DisclaimerSection />

                <LineOfServiceDocuments />

                <Divider className='mb-2 mt-0 p-0' />

                <OwnerSection form={form} supportLoS={supportLoS} setSubLoSSelected={setSubLoSSelected} setSupportLoS={setSupportLoS} />

                <Divider className='mb-2 mt-0 p-0' />

                <SupportSection form={form} />

                <footer className='flex justify-end gap-4 absolute bottom-0 right-0 bg-white p-2 w-full pt-4 px-5 border-t-black/5 border-t-2 rounded-b-full pb-4'>
                    <Button variant='light' className='text-black hover:text-white' onPress={() => setMassiveConfigurationIsOpen(false)}>
                        Cancelar
                    </Button>
                    <Button variant='shadow' color='primary' onPress={() => handleSubmit()}>
                        Guardar y publicar <ArrowRightIcon />
                    </Button>
                </footer>
            </Form>
            {loadingModal && <LoadingSpin />}
            {errorModal && <ErrorOnMassiveConf />}
        </Modal>
    );
}
