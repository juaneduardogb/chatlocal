import { Accordion, AccordionItem } from '@heroui/react';
import { Divider } from 'antd';

import { LoaderState } from './DocDrawer';
import LabelsIAInformation from './LabelsIAInformation';

import SplashDeleteDocument from '@/components/document-drawer/SplashDeleteDocument';
import SplashErrorDeleteDocument from '@/components/document-drawer/SplashErrorDeleteDocument';
import LabelsTag from '@/components/form/LabelsTag';
import SplashLoader from '@/components/SplashLoader';
import { BasicPerson, Document, TagsElements } from '@/types/documents';

type DocumentViewStateProps = {
    document: Document;
    loaderState: LoaderState;
};

type InfoSectionProps = {
    title: string;
    content: string | undefined;
};

type LabelsSectionProps = {
    labels: TagsElements[];
};

type PeopleSectionProps = {
    people: BasicPerson[];
};

function InfoSection({ title, content }: InfoSectionProps) {
    return (
        <section className='grid gap-y-4'>
            <p>{title} *</p>
            <div className='bg-container_menu border border-neutral-300 p-2 text-truncate min-h-10'>{content}</div>
        </section>
    );
}

function LabelsSection({ labels }: LabelsSectionProps) {
    return (
        <section className='flex gap-4 flex-wrap'>
            {labels.map(label => (
                <LabelsTag tag={label} key={label.id} />
            ))}
        </section>
    );
}

function PeopleSection({ people }: PeopleSectionProps) {
    return (
        <section className='grid gap-y-2'>
            {people.map(person => (
                <div className='bg-pink-600/10 rounded-md p-2' key={person.email}>
                    {person.name} - {person.email}
                </div>
            ))}
        </section>
    );
}

export default function DocumentViewMode({ document, loaderState }: DocumentViewStateProps) {
    return loaderState.error ? (
        <SplashErrorDeleteDocument />
    ) : loaderState.successDelete ? (
        <SplashDeleteDocument />
    ) : loaderState.loading ? (
        <SplashLoader splashText={loaderState.loaderText} />
    ) : (
        <section className='grid gap-y-4'>
            <Accordion variant='bordered' className='bg-container_menu' defaultExpandedKeys={['1']}>
                <AccordionItem
                    title={
                        <>
                            <span className='font-bold text-wrap'>Base de conocimiento: </span>
                            {document.knowledgeBase.name}
                        </>
                    }
                    className='bg-container_menu rounded-lg border-2'
                    key='1'
                >
                    <section className=''>
                        <div>
                            <span className='font-semibold'>ID: </span> {document.knowledgeBase.knowledgeId}
                        </div>
                        <div>
                            <span className='font-semibold'>Autor: </span> {document.knowledgeBase.author}
                        </div>
                        <div>
                            <span className='font-semibold'>Descripción: </span> {document.knowledgeBase.description}
                        </div>
                        <div>
                            <span className='font-semibold'>Fecha de creación: </span>
                            {new Date(document.knowledgeBase.createdAt).toLocaleString()}
                        </div>
                        <div>
                            <span className='font-semibold'>Última actualización: </span>
                            {new Date(document.knowledgeBase.lastUpdate).toLocaleString()}
                        </div>
                    </section>
                </AccordionItem>
            </Accordion>

            <p className='font-bold'>Información general del documento</p>
            <InfoSection title='Nombre del documento' content={document.documentName} />
            <InfoSection title='Resumen general del contenido' content={document.summary} />

            <Divider className='my-2' />

            <div className='grid gap-3'>
                <p className='font-bold'>Palabras clave para que la IA busque información en los documentos</p>
                {!!document.labels ? <LabelsSection labels={document.labels} /> : 'Sin Información'}
            </div>
            <Divider className='my-2' />

            <LabelsIAInformation metaData={document.metaData} />

            <Divider className='my-2' />
            <div className='grid gap-3'>
                <p className='font-bold'>Etiquetas para distinguir y describir uso de los documentos</p>
                {!!document.tagsByAuthor && document.tagsByAuthor.length >= 1 ? (
                    <LabelsSection labels={document.tagsByAuthor} />
                ) : (
                    'Sin Información'
                )}
            </div>

            <Divider className='my-2' />
            <p className='font-bold'>Accesos de documentos</p>
            <InfoSection title='Línea de servicio' content={document.los.map(los => los.toLocaleString()).join(', ')} />
            <InfoSection title='Selección de cargo' content={document.profiles.map(profile => profile.toLocaleString()).join(', ')} />
            <section className='grid xs:grid-cols-1 grid-cols-2 gap-4'>
                <InfoSection
                    title='Tipo de jornada'
                    content={document.typeOfWorkday.map(typeOfWorkday => typeOfWorkday.toLocaleString()).join(', ')}
                />
                <InfoSection
                    title='Tipo de contrato'
                    content={document.contractType.map(contractType => contractType.toLocaleString()).join(', ')}
                />
            </section>
            <Divider className='my-2' />

            <p className='font-bold'>Owner</p>
            <section className='grid md:grid-cols-2 gap-4'>
                <InfoSection title='LoS' content={document.losOwner} />
                <InfoSection title='Sub LoS' content={document.subLoS} />
            </section>

            <Divider className='my-2' />
            <p className='font-bold'>Soporte</p>
            <PeopleSection people={document.support} />
        </section>
    );
}
