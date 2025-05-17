import { ColumnDef, flexRender } from '@tanstack/react-table';
import { Table as TableTanStack } from '@tanstack/react-table';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableKnowledgeBaseProps {
    table: TableTanStack<Document>;
    columns: ColumnDef<Document, unknown>[];
}
export default function TableKnowledgeBase({ table, columns }: TableKnowledgeBaseProps) {
    return (
        <ScrollArea className='xs:h-[45vh]'>
            <Table className='text-xs'>
                <TableHeader className='bg-table-head-color'>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className='bg-table-head-color'>
                            {headerGroup.headers.map(header => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div className='flex items-center gap-2 text-center'>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
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
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className='h-24 text-center'>
                                No existen documentos asociados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <ScrollBar orientation='horizontal'></ScrollBar>
        </ScrollArea>
    );
}
