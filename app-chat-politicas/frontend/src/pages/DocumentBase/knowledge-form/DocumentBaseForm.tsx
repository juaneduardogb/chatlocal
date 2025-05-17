import { Modal } from 'antd';
import { useState } from 'react';

import KnowledgeConfiguration from './steps/KnowledgeConfiguration';
import KnowledgeName from './steps/KnowledgeName';
import SelectFolderStep from './steps/SelectFolderStep';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentFormStore } from '@/store/document/document.store';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';

function DocumentBaseForm() {
    const { updateStatusModalUKB, modalKnowledgeIsOpen } = useKnowledgeBaseStore(state => state);
    const { clear } = useDocumentFormStore(state => state);

    const [currentStepInForm, setCurrentStepInForm] = useState<'knowledge-configuration' | 'knowledge-name' | 'select-folder'>(
        'select-folder'
    );

    return (
        <Modal
            centered
            open={modalKnowledgeIsOpen}
            onOk={() => {
                clear();
                updateStatusModalUKB();
            }}
            onCancel={() => {
                clear();
                updateStatusModalUKB();
            }}
            className='min-w-[60vw]'
            footer={null}
            closable={false}
            maskClosable={false}
            onClose={e => e.preventDefault()}
        >
            <Tabs defaultValue={currentStepInForm} value={currentStepInForm} className='text-black p-0'>
                <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='select-folder'>1. Carpeta</TabsTrigger>
                    <TabsTrigger value='knowledge-name'>2. Nombre</TabsTrigger>
                    <TabsTrigger value='knowledge-configuration'>3. Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value='select-folder' className='text-xs grid gap-y-5'>
                    <SelectFolderStep setCurrentStepInForm={setCurrentStepInForm} updateStatusModalUKB={updateStatusModalUKB} />
                </TabsContent>
                <TabsContent value='knowledge-name'>
                    <KnowledgeName setCurrentStepInForm={setCurrentStepInForm} updateStatusModalUKB={updateStatusModalUKB} />
                </TabsContent>
                <TabsContent value='knowledge-configuration' className='text-xs max-h-[70vh] min-w-[40vw] overflow-y-auto px-4 pb-20'>
                    <KnowledgeConfiguration setCurrentStepInForm={setCurrentStepInForm} />
                </TabsContent>
            </Tabs>
        </Modal>
    );
}

export default DocumentBaseForm;
