import { Button } from '@heroui/button';
import { Divider, Form } from 'antd';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DisclaimerSection from '@/components/DisclaimerSection';
import LabelsCustomByAuthor from '@/components/form/LabelsCustomByAuthor';
import LabelsIA from '@/components/form/LabelsIA';
import LineOfServiceDocuments from '@/components/LineOfService';
import OwnerSection from '@/components/OwnerSection';
import SupportSection from '@/components/SupportSection';
import routes from '@/constants/routes';
import { useDocumentFormStore } from '@/store/document/document.store';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';
import { TagsElements } from '@/types/documents';

interface IKnowledgeConfigurationProps {
    setCurrentStepInForm: React.Dispatch<React.SetStateAction<'knowledge-configuration' | 'knowledge-name' | 'select-folder'>>;
}

export default function KnowledgeConfiguration({ setCurrentStepInForm }: IKnowledgeConfigurationProps) {
    const { updateStatusModalUKB } = useKnowledgeBaseStore(state => state);

    const { saveConfiguration } = useDocumentFormStore(state => state);
    const navigate = useNavigate();

    const [form] = Form.useForm();

    const [_, setSubLoSSelected] = useState<string>('');

    const [supportLoS, setSupportLoS] = useState<string>('');

    const [tagsIA, setTagsIA] = useState<TagsElements[] | null>(null);

    const [tagsByAuthor, setTagsByAuthor] = useState<TagsElements[] | null>(null);

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                saveConfiguration(
                    tagsIA || [],
                    tagsByAuthor || [],
                    values.los,
                    values.profile,
                    values.losOwner,
                    values.subLoS,
                    values.typeOfWorkday,
                    values.contractType,
                    values.supportPersons.map((person: string) =>
                        JSON.parse(
                            person
                                .trim()
                                .replace(/'/g, '"')
                                .replace(/(\w+):/g, '"$1":')
                        )
                    )
                );
                navigate(routes.documentUploadStage.name);
            })
            .catch(errorInfo => {
                console.log('Failed:', errorInfo);
            });
    };

    return (
        <>
            <DisclaimerSection />

            <Form form={form} autoComplete='off' initialValues={{ subLoSSelected: null }}>
                <section className='w-full mt-5 grid gap-y-3'>
                    <LabelsIA tagsIA={tagsIA} setTagsIA={setTagsIA} />

                    <Divider className='my-1' />

                    <LabelsCustomByAuthor tagsByAuthor={tagsByAuthor} setTagsByAuthor={setTagsByAuthor} />
                </section>

                <Divider />

                <LineOfServiceDocuments />

                <Divider className='m-2 mb-4' />

                <OwnerSection setSupportLoS={setSupportLoS} supportLoS={supportLoS} form={form} setSubLoSSelected={setSubLoSSelected} />

                <Divider className='mb-2' />

                <SupportSection form={form} />

                <footer className='flex justify-end gap-4 absolute bottom-0 right-0 bg-white p-2 w-full pt-4 px-5 border-t-black/5 border-t-2 rounded-b-full pb-4'>
                    <Button
                        variant='ghost'
                        className='text-black hover:text-white'
                        onPress={() => setCurrentStepInForm('knowledge-name')}
                        type='button'
                        autoFocus={false}
                    >
                        <ArrowLeftIcon /> Atrás
                    </Button>
                    <Button variant='bordered' color='primary' onPress={() => updateStatusModalUKB()} autoFocus={false}>
                        Cancelar
                    </Button>
                    <Button variant='shadow' color='primary' onPress={() => handleSubmit()} autoFocus={false}>
                        Siguiente <ArrowRightIcon />
                    </Button>
                </footer>
            </Form>
        </>
    );
}
