import { Button } from '@heroui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRightIcon } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

import TagsColumns from '@/components/TagsColumns';
import routes from '@/constants/routes';
import { KnowledgeBase, LineOfService } from '@/types/documents';

const parseLocaleDateString = (localeDateString: string) => {
    // Assuming the date string is in "DD/MM/YYYY" format
    const [day, month, year] = localeDateString.split('/').map(Number);
    return new Date(year, month - 1, day);
};

export default function knowledgeColumns(navigate: NavigateFunction): ColumnDef<KnowledgeBase, unknown>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nombre de base',
            cell: ({ row }) => <div className='capitalize min-w-[130px] text-nowrap text-ellipsis'>{row.getValue('name')}</div>,
            meta: {
                filterVariant: 'input'
            },
            size: 200,
            minSize: 200
        },
        {
            accessorKey: 'description',
            header: 'Descripción',
            cell: ({ row }) => <div className='capitalize min-w-[130px] text-nowrap text-ellipsis'>{row.getValue('description')}</div>,
            meta: {
                filterVariant: 'input'
            },
            size: 200,
            minSize: 200,
            maxSize: 300
        },
        {
            accessorKey: 'totalDocuments',
            header: 'Total Docs',
            cell: ({ row }) => <div className='upper text-center'>{row.getValue('totalDocuments')}</div>,
            meta: {
                filterVariant: 'input'
            },
            minSize: 50,
            size: 50,
            filterFn: (row, _, filterValue) => {
                return row.original.totalDocuments === parseInt(filterValue);
            }
        },
        {
            accessorKey: 'knowledgeId',
            header: 'ID Proceso',
            cell: ({ row }) => <div className='upper text-nowrap'>{row.getValue('knowledgeId')}</div>,
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

                return <TagsColumns allLabels={labelStrings} bgColor='bg-amber-400/30' />;
            },
            meta: {
                filterVariant: 'select-los'
            },
            filterFn: (row, _, filterValue) => {
                return filterValue.some((filterItem: LineOfService) => row.original.los.includes(filterItem));
            }
        },

        {
            accessorKey: 'losOwner',
            header: 'LoS Owner',
            cell: ({ row }) => {
                return <>{row.original.losOwner}</>;
            },
            accessorFn: row => row.losOwner
        },
        {
            accessorKey: 'subLoS',
            header: 'Sub LoS',
            cell: ({ row }) => {
                return <>{row.original.subLoS}</>;
            },
            accessorFn: row => row.subLoS
        },
        {
            accessorKey: 'support',
            header: 'Soporte',
            cell: ({ row }) => {
                const persons = row.original.support.map(person => person.name);
                return <TagsColumns allLabels={persons} bgColor='bg-amber-400/30' />;
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
            accessorKey: 'lastUpdate',
            header: 'Fecha actualización',
            cell: ({ row }) => <div className='upper text-center'>{new Date(row.getValue('lastUpdate')).toLocaleDateString()}</div>,
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
                        navigate(`${routes.knowledgeBase.name}/${row.original.knowledgeId}`);
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
