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
import { useEffect, useState } from 'react';

import PaginatorKnowledgeBase from '../../KnowledgeBase/components/PaginatorKnowledgeBase';
import DocumentDrawer from '../../KnowledgeBase/DocumentDrawer/DocDrawer';
import docsColumns from '../docsColumns';

import FilterColumns from '@/components/FilterColumns';
import GenericTableHeaderWithIndicators from '@/components/GenericTableHeaderWithIndicators';
import { renderErrorComponent } from '@/components/renderCustomError';
import SplashLoader from '@/components/SplashLoader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDocuments } from '@/hooks/useDocuments';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';
import { TableIndicatorType } from '@/types/documents';

interface DocumentsViewProps {
    defaultDocStatus: 'Revisión pendiente' | 'Publicado';
}
export function DocumentsView({ defaultDocStatus }: DocumentsViewProps) {
    const { data, isLoading, isSuccess, error, refetch: refetchTableDocuments } = useDocuments();

    const [indicators, setIndicators] = useState<TableIndicatorType[]>([]);
    const [indicatorLoading, setIndicatorLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState({});
    const [docSelectedIsOpen, setDocSelectedIsOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
        {
            id: 'status',
            value: defaultDocStatus
        }
    ]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ id: true });
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 5 //default page size
    });
    const { docSelectedInKnowledgeBase } = useKnowledgeBaseStore(state => state);

    const columns = docsColumns(docSelectedInKnowledgeBase, setDocSelectedIsOpen);

    const table = useReactTable({
        data: data?.documents || [],
        columns,
        onRowSelectionChange: setRowSelection,
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
            columnFilters,
            rowSelection
        },
        initialState: {
            pagination: {
                pageSize: 10
            }
        },
        manualPagination: false
    });

    useEffect(() => {
        setIndicators([
            { title: 'Pendiente', total: data?.totalPending || 0 },
            { title: 'En proceso', total: data?.totalPending || 0 },
            { title: 'Publicado', total: data?.totalPublished || 0 },
            { title: 'Total de docs', total: data?.totalDocuments || 0 }
        ]);
        setIndicatorLoading(false);
    }, [data]);

    if (error) {
        return renderErrorComponent(error);
    }

    return (
        <div className='max-w-[85vw] !min-w-[85vw]'>
            {docSelectedIsOpen && (
                <DocumentDrawer
                    docSelectedIsOpen={docSelectedIsOpen}
                    setDocSelectedIsOpen={setDocSelectedIsOpen}
                    refetchKnowledgeBase={refetchTableDocuments}
                />
            )}
            {isLoading && (
                <div className='relative w-full h-[60vh]'>
                    <SplashLoader className='bg-background' />
                </div>
            )}
            {isSuccess && (
                <section className='mt-5'>
                    <GenericTableHeaderWithIndicators
                        // @ts-expect-error
                        table={table}
                        indicators={indicators}
                        data={data}
                        setColumnFilters={setColumnFilters}
                        defaultDocStatus={defaultDocStatus}
                        indicatorLoading={indicatorLoading}
                        showMassiveButton={false}
                        refetch={refetchTableDocuments}
                    />
                    <ScrollArea className='h-[55vh] w-auto'>
                        <Table>
                            <TableHeader className='bg-container_menu'>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id} className='bg-container_menu'>
                                        {headerGroup.headers.map(header => {
                                            return (
                                                <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
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
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            className='text-xs bg-background'
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center bg-background'>
                                            No existen registros de documentos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation='horizontal' />
                    </ScrollArea>

                    <div className='flex items-center justify-between w-full'>
                        <div className='flex gap-4 flex-wrap text-xs items-center w-full'>
                            <p>Total: {table.getFilteredRowModel().rows.length} fila(s).</p>
                        </div>
                        {/**@ts-expect-error */}
                        <PaginatorKnowledgeBase table={table} />
                    </div>
                </section>
            )}
        </div>
    );
}
