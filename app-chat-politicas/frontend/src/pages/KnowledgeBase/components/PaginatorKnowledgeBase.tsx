import { Table } from '@tanstack/react-table';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PaginatorKnowledgeBaseProps {
    table: Table<Document>;
}

function PaginatorKnowledgeBase({ table }: PaginatorKnowledgeBaseProps) {
    return (
        <section className='flex items-center'>
            <div className='flex gap-x-2'>
                <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} variant={'ghost'}>
                    Primera
                </Button>
                <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} variant={'ghost'}>
                    <ArrowLeft />
                </Button>
                <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant={'ghost'}>
                    <ArrowRight />
                </Button>
                <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} variant={'ghost'}>
                    Última
                </Button>
            </div>
        </section>
    );
}

export default PaginatorKnowledgeBase;
