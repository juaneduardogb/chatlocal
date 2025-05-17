import { Button } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRightIcon } from 'lucide-react';
import { SetStateAction } from 'react';

import DocumentStatusSelector from './components/DocumentStatus';

import TagsColumns from '@/components/TagsColumns';
import { GenericLabel } from '@/types';
import { Document, LineOfService, TagsElements } from '@/types/documents';

const parseLocaleDateString = (localeDateString: string) => {
    // Assuming the date string is in "DD/MM/YYYY" format
    const [day, month, year] = localeDateString.split('/').map(Number);
    return new Date(year, month - 1, day);
};

export default function docsColumns(
    docSelectedInKnowledgeBase: { (data: Document): void },
    setDocSelectedIsOpen: { (value: SetStateAction<boolean>): void; (arg0: boolean): void }
): ColumnDef<Document, unknown>[] {
    return [
        {
            accessorKey: 'documentName',
            header: 'Nombre documento',
            cell: ({ row }) => <div className='capitalize min-w-[130px] text-nowrap text-ellipsis'>{row.getValue('documentName')}</div>,
            meta: {
                filterVariant: 'input'
            },
            size: 200,
            minSize: 200
        },
        {
            accessorKey: 'uniqueProcessID',
            header: 'ID Proceso',
            cell: ({ row }) => <div className='upper text-nowrap'>{row.getValue('uniqueProcessID')}</div>,
            meta: {
                filterVariant: 'input'
            },
            minSize: 200,
            size: 200
        },
        {
            accessorKey: 'los',
            header: 'LoS Acceso',
            cell: ({ row }) => {
                const allLabels: LineOfService[] = row.getValue('los');

                const labelStrings = allLabels.map(label => label.toString());

                return <TagsColumns allLabels={labelStrings} bgColor='bg-[#fb24244d]' />;
            },
            minSize: 200,
            size: 200,
            maxSize: 200,
            meta: {
                filterVariant: 'select-los'
            },
            filterFn: (row, _, filterValue) => {
                return filterValue.some((filterItem: LineOfService) => row.original.los.includes(filterItem));
            }
        },
        {
            accessorKey: 'tagsByAuthor',
            header: 'Categoría/Tipo',
            cell: ({ row }) => {
                const tagsByAuthor: GenericLabel[] = row.getValue('tagsByAuthor');

                const labels = tagsByAuthor.map(label => label.label);

                return <TagsColumns allLabels={labels} />;
            },
            meta: {
                filterVariant: 'input'
            },
            filterFn: (row, _, filterValue) => {
                if (!!row.original.tagsByAuthor) {
                    return row.original.tagsByAuthor.some((filterItem: TagsElements) => filterItem.label.includes(filterValue));
                } else {
                    return false;
                }
            }
        },
        {
            accessorKey: 'losOwner',
            header: 'LoS Owner',
            cell: ({ row }) => {
                return <div className='flex'>{row.original.losOwner}</div>;
            },
            meta: {
                filterVariant: 'input'
            }
        },
        {
            accessorKey: 'subLoS',
            header: 'Sub LoS',
            cell: ({ row }) => {
                return <div className='flex min-w-40 w-fit'>{row.original.subLoS}</div>;
            },
            meta: {
                filterVariant: 'input'
            },
            size: 200,
            minSize: 200
        },
        {
            accessorKey: 'support',
            header: 'Soporte',
            cell: ({ row }) => {
                const persons = row.original.support.map(person => person.name);
                return <TagsColumns allLabels={persons} bgColor='bg-[#fb24244d]' />;
            },
            meta: {
                filterVariant: 'input'
            },
            filterFn: (row, _, filterValue: string) => {
                const support = row.original.support.map(owner => owner.name.toLowerCase());
                return support.some((filterItem: string) => filterItem.includes(filterValue.toLowerCase()));
            }
        },

        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ row }) => {
                const isPublished = row.original.isPublished;
                const allStatusesDocument = row.original.statuses;

                const previousPublishStatus =
                    allStatusesDocument.access.confirmation &&
                    allStatusesDocument.labels.confirmation &&
                    allStatusesDocument.owners.confirmation &&
                    allStatusesDocument.support.confirmation;

                let statusName = '';

                if (isPublished) {
                    statusName = 'Publicado';
                } else if (previousPublishStatus && isPublished === false) {
                    statusName = 'Revisión en proceso';
                } else {
                    statusName = 'Revisión pendiente';
                }

                return (
                    <div className='min-w-[160px]'>
                        <DocumentStatusSelector statusName={statusName} />
                    </div>
                );
            },

            filterFn: (row, _, filterValue) => {
                const isPublished = row.original.isPublished;

                const allStatusesDocument = row.original.statuses;

                const previousPublishStatus =
                    allStatusesDocument.access.confirmation &&
                    allStatusesDocument.labels.confirmation &&
                    allStatusesDocument.owners.confirmation &&
                    allStatusesDocument.support.confirmation;

                if (filterValue === 'Publicado') {
                    return row.original.isPublished;
                } else if (filterValue === 'Revisión en proceso') {
                    console.log(previousPublishStatus && isPublished === false);
                    return previousPublishStatus && isPublished === false;
                } else if (filterValue === 'Revisión pendiente') {
                    return previousPublishStatus === false && isPublished === false;
                }
                return false;
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Fecha registro',
            cell: ({ row }) => <div className='upper text-center'>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>,
            meta: {
                filterVariant: 'input'
            },
            filterFn: (row, _, filterValue: string) => {
                return new Date(row.original.createdAt).toLocaleDateString() === parseLocaleDateString(filterValue).toLocaleDateString();
            }
        },
        {
            id: 'actions',
            header: 'Ficha',
            enableHiding: false,
            cell: ({ row }) => (
                <Button
                    className='rounded-full px-1 py-1 '
                    onPress={() => {
                        setDocSelectedIsOpen(true);
                        docSelectedInKnowledgeBase(row.original);
                    }}
                    color='default'
                    size='sm'
                    variant='ghost'
                >
                    <ArrowRightIcon />
                </Button>
            )
        }
    ];
}
