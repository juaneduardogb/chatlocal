import { Input, Textarea, Button } from '@heroui/react';
import { Divider, Form } from 'antd';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

import { useDocumentFormStore } from '@/store/document/document.store';

interface IKnowledgeNameProps {
    setCurrentStepInForm: React.Dispatch<React.SetStateAction<'select-folder' | 'knowledge-configuration' | 'knowledge-name'>>;
    updateStatusModalUKB: () => void;
}

type CurrentStepFormValues = {
    knowledgeBaseDescription: string;
    knowledgeBaseName: string;
};

export default function KnowledgeName({ setCurrentStepInForm, updateStatusModalUKB }: IKnowledgeNameProps) {
    const [form] = Form.useForm();

    const { saveTitleAndDescription, clear, name, description } = useDocumentFormStore(state => state);

    const handleSubmit = () => {
        form.validateFields()
            .then((values: CurrentStepFormValues) => {
                saveTitleAndDescription(values.knowledgeBaseName, values.knowledgeBaseDescription);
                setCurrentStepInForm('knowledge-configuration');
            })
            .catch(errorInfo => {
                console.log('Failed:', errorInfo);
            });
    };

    const initialValues = {
        knowledgeBaseDescription: description,
        knowledgeBaseName: name
    };

    return (
        <Form form={form} className='grid gap-y-2 text-xs' initialValues={initialValues}>
            <h2 className='font-bold md:text-lg text-xs'>Información general de la base de conocimiento</h2>
            <div>
                <p>Nombre de base de conocimiento *</p>
                <Form.Item
                    name='knowledgeBaseName'
                    rules={[
                        { required: true, message: 'Este campo es requerido.' },
                        { min: 2, message: 'El nombre debe tener al menos 2 caracteres.' }
                    ]}
                >
                    <Input placeholder='Ingresa el nombre de la base de conocimientos.' className='mt-2' />
                </Form.Item>
            </div>
            <div>
                <p>Descripción general del contenido *</p>
                <Form.Item
                    name='knowledgeBaseDescription'
                    rules={[
                        { required: true, message: 'Este campo es requerido.' },
                        { min: 2, message: 'La descripción debe tener al menos 2 caracteres.' }
                    ]}
                >
                    <Textarea placeholder='Registrar descripción de contenido' className='mt-2' />
                </Form.Item>
            </div>
            <Divider className='mb-1' />

            <footer className='flex justify-end gap-4 text-black'>
                <Button
                    variant='ghost'
                    className='text-black hover:text-white'
                    onPress={() => setCurrentStepInForm('select-folder')}
                    type='button'
                >
                    <ArrowLeftIcon /> Atrás
                </Button>
                <Button
                    color='danger'
                    variant='bordered'
                    onPress={() => {
                        clear();
                        updateStatusModalUKB();
                    }}
                >
                    Cancelar
                </Button>
                <Button color='primary' variant='shadow' onPress={() => handleSubmit()} type='button'>
                    Siguiente <ArrowRightIcon />
                </Button>
            </footer>
        </Form>
    );
}
