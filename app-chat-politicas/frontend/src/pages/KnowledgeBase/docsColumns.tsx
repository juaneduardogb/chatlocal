import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { SetStateAction } from 'react';

import StatusIndicator from './components/StatusIndicator';

import { Document, DocumentStatus } from '@/types/documents';

export default function docsColumns(
    docSelectedInKnowledgeBase: { (data: Document): void },
    setDocSelectedIsOpen: { (value: SetStateAction<boolean>): void; (arg0: boolean): void }
): ColumnDef<Document, unknown>[] {
    return [
        {
            accessorKey: 'id',
            header: ({ table }) => (
                <Checkbox
                    isSelected={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
                    onValueChange={value => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    isSelected={row.getIsSelected()}
                    onValueChange={value => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    disabled={row.original.isPublished}
                />
            ),
            accessorFn: row => row.id
        },
        {
            accessorKey: 'documentName',
            header: 'Nombre del documento',
            cell: ({ row }) => <div className='w-[300px] text-ellipsis text-truncate'>{row.getValue('documentName')}</div>,
            accessorFn: row => row.documentName
        },
        {
            accessorKey: 'sizeFormatted',
            header: 'Peso doc.',

            cell: ({ row }) => <div className='w-[100px]'>{row.getValue('sizeFormatted')}</div>,
            accessorFn: row => row.sizeFormatted
        },
        {
            accessorKey: 'labels',
            header: 'Etiquetas',
            cell: ({ row }) => {
                const statuses: DocumentStatus = row.getValue('statuses');
                return <StatusIndicator confirmation={statuses.labels.confirmation} />;
            },
            accessorFn: row => row.labels
        },
        {
            accessorKey: 'profiles',
            header: 'Accesos',
            cell: ({ row }) => {
                const statuses: DocumentStatus = row.getValue('statuses');
                return <StatusIndicator confirmation={statuses.access.confirmation} />;
            },
            accessorFn: row => row.profiles
        },
        {
            accessorKey: 'support',
            header: 'Soporte',
            cell: ({ row }) => {
                const statuses: DocumentStatus = row.getValue('statuses');
                return <StatusIndicator confirmation={statuses.support.confirmation} />;
            },
            accessorFn: row => row.support
        },
        {
            accessorKey: 'losOwner',
            header: 'LoS Owner',
            cell: ({ row }) => {
                const statuses: DocumentStatus = row.getValue('statuses');
                return <StatusIndicator confirmation={statuses.owners.confirmation} />;
            },
            accessorFn: row => row.losOwner
        },
        {
            accessorKey: 'statuses',
            header: 'Estado revisión',
            cell: ({ row }) => {
                const statuses: DocumentStatus = row.getValue('statuses');

                const labels = statuses.labels.confirmation;
                const owners = statuses.owners.confirmation;
                const support = statuses.support.confirmation;
                const access = statuses.access.confirmation;
                const publish = statuses.publish.confirmation;

                const isConfirmed = labels && owners && support && publish && access;

                return (
                    <div className='text-center flex gap-2 items-center'>
                        <div className={`h-2 w-2 rounded-full ${isConfirmed ? 'bg-green-500' : 'bg-status-warning-color'}`}></div>
                        {isConfirmed ? 'Completado' : 'Pendiente'}
                    </div>
                );
            },
            accessorFn: row => row.statuses
        },
        {
            id: 'isPublished',
            header: 'Publicado',
            accessorKey: 'isPublished',
            filterFn: (rows, _, filterValue) => {
                return rows.getValue('isPublished') === filterValue;
            }
        },
        {
            id: 'actions',
            header: 'Ficha',
            enableHiding: false,
            cell: ({ row }) => {
                return (
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
                );
            },

            accessorFn: row => row.uniqueProcessID
        }
    ];
}
