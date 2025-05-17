import { ClearOutlined } from '@ant-design/icons';
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { message } from 'antd';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DocumentDrawer from '../../KnowledgeBase/DocumentDrawer/DocDrawer';
import knowledgeColumns from '../knowledgeColumns';

import FilterColumns from '@/components/FilterColumns';
import { renderErrorComponent } from '@/components/renderCustomError';
import SplashLoader from '@/components/SplashLoader';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllKnowledgeBase } from '@/hooks/useKnowledgeBase';
import PaginatorKnowledgeBase from '@/pages/KnowledgeBase/components/PaginatorKnowledgeBase';
export default function KnowledgeView() {
    const navigate = useNavigate();
    const { data, isLoading, isSuccess, error, refetch: refetchTableKnowledge } = useGetAllKnowledgeBase();

    const [docSelectedIsOpen, setDocSelectedIsOpen] = useState(false);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ id: false });
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10 //default page size
    });

    const columns = knowledgeColumns(navigate);

    const table = useReactTable({
        data: data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnVisibility,
            pagination,
            columnFilters
        },
        initialState: {
            pagination: {
                pageSize: 10 // Aumentamos a 10 filas por página por defecto
            }
        },
        manualPagination: false
    });

    if (error) {
        return renderErrorComponent(error);
    }

    return (
        <div className='max-w-[85vw] !min-w-[85vw]'>
            {docSelectedIsOpen && (
                <DocumentDrawer
                    docSelectedIsOpen={docSelectedIsOpen}
                    setDocSelectedIsOpen={setDocSelectedIsOpen}
                    // @ts-expect-error
                    refetchKnowledgeBase={refetchTableKnowledge}
                />
            )}
            <section className='flex justify-between flex-wrap items-center text-xs '>
                <p className=' font-semibold max-w-[80%]'>
                    Esta vista muestra un resumen del listado de bases de conocimientos existentes.
                </p>
                <div className='flex gap-2 flex-wrap text-xs items-center xs:justify-between xs:bg-red-500xs'>
                    <Button
                        variant='outline'
                        type='button'
                        onClick={() => {
                            message.success('Se han limpiado los filtros.');
                            setColumnFilters([]);
                        }}
                    >
                        <ClearOutlined />
                    </Button>
                    <Button
                        variant={'outline'}
                        type='button'
                        onClick={() => {
                            refetchTableKnowledge();
                            message.success('Se han actualizado los registros.');
                        }}
                    >
                        <RotateCcw />
                    </Button>
                </div>
            </section>

            {isLoading && (
                <div className='relative w-full h-[60vh]'>
                    <SplashLoader className='bg-white-default' />
                </div>
            )}
            {isSuccess && (
                <section className='mt-5'>
                    <ScrollArea className='!h-[60vh] w-auto'>
                        <Table>
                            <TableHeader className='bg-table-head-color'>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id} className='bg-table-head-color'>
                                        {headerGroup.headers.map(header => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : (
                                                        <div className='flex items-center gap-2 text-nowrap'>
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {/** @ts-ignore */}
                                                            {header.column.getCanFilter() && <FilterColumns column={header.column} />}
                                                        </div>
                                                    )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='text-xs'>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                            No existen registros de documentos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>
                    <div className='flex items-center justify-between w-full text-xs'>
                        <div className=''>Total: {table.getFilteredRowModel().rows.length} fila(s).</div>

                        {/**@ts-ignore */}
                        <PaginatorKnowledgeBase table={table} />
                    </div>
                </section>
            )}
        </div>
    );
}
