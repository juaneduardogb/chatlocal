import { useWindowSize } from '@uidotdev/usehooks';
import { FolderPlus } from 'lucide-react';
import { useEffect } from 'react';

import HeaderDocument from './components/header/HeaderDocument';
import DocumentBaseForm from './knowledge-form/DocumentBaseForm';
import { DocumentsView } from './tabs/DocumentsView';
import KnowledgeView from './tabs/KnowledgeView';

import { useDocumentFormStore } from '@/store/document/document.store';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';

const tabsItems = [
    {
        title: 'Doc pendientes',
        content: <DocumentsView defaultDocStatus='Revisión pendiente' />
    },
    {
        title: 'Doc publicados',
        content: <DocumentsView defaultDocStatus='Publicado' />
    },
    {
        title: 'Bases',
        content: <KnowledgeView />
    }
];

export default function DocumentBase() {
    const { updateStatusModalUKB, modalKnowledgeIsOpen } = useKnowledgeBaseStore(state => state);
    const { clear } = useDocumentFormStore(state => state);

    const size = useWindowSize();

    const btnCallToActionInfo = {
        title:
            (size.width ?? 0) <= 500 ? (
                <>
                    <FolderPlus /> Crear base
                </>
            ) : (
                'Cargar base de conocimiento'
            ),
        onClick: () => {
            updateStatusModalUKB(true);
        }
    };

    useEffect(() => {
        updateStatusModalUKB(false);
        clear();
    }, []);

    return (
        <main className='!min-w-[70vw] md:pl-16 mx-auto mt-10'>
            <HeaderDocument
                headerTitle='Gestor de documentos chat'
                tabsContentAndTitles={tabsItems}
                buttonsCallToAction={[btnCallToActionInfo]}
            />
            {modalKnowledgeIsOpen && <DocumentBaseForm />}
        </main>
    );
}
