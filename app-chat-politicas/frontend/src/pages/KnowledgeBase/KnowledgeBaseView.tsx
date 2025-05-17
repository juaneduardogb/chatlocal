import {
    ColumnFiltersState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { Divider } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import GenericTableHeaderWithIndicators from '../../components/GenericTableHeaderWithIndicators';
import HeaderDocument from '../DocumentBase/components/header/HeaderDocument';

import MassiveDocumentsConfiguration from './components/MassiveDocumentsConfiguration';
import PaginatorKnowledgeBase from './components/PaginatorKnowledgeBase';
import docsColumns from './docsColumns';
import DocumentDrawer from './DocumentDrawer/DocDrawer';
import TableKnowledgeBase from './TableKnowledgeBase';

import { renderErrorComponent } from '@/components/renderCustomError';
import SplashLoader from '@/components/SplashLoader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import routes from '@/constants/routes';
import { useDocumentsFromKnowledge } from '@/hooks/useKnowledgeBase';
import useKnowledgeBaseStore from '@/store/documents-base/documents-base.store';

export default function KnowledgeBaseView() {
    const { knowledgeBaseId } = useParams();

    const navigate = useNavigate();

    const { data, isLoading, isSuccess, error, refetch: refetchKnowledgeBase } = useDocumentsFromKnowledge(knowledgeBaseId || '');

    const [massiveConfigurationIsOpen, setMassiveConfigurationIsOpen] = useState<boolean>(false);
    const [rowSelection, setRowSelection] = useState({});

    const [docSelectedIsOpen, setDocSelectedIsOpen] = useState(false); // Tiene relación con el drawer para ver o editar documento
    const [indicatorLoading, setIndicatorLoading] = useState(true);

    const { docSelectedInKnowledgeBase } = useKnowledgeBaseStore(state => state);

    const columns = docsColumns(docSelectedInKnowledgeBase, setDocSelectedIsOpen);

    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10 //default page size
    });

    const finalData = isSuccess ? data.documents : [];
    const knowledgeBase = isSuccess ? data.knowledgeBase : null;

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'isPublished', value: false }]);
    const [columnVisibles, setColumnVisibles] = useState<VisibilityState>({ isPublished: false });

    const indicators = [
        { title: 'Pendientes', total: data?.totalPending ?? 0 },
        { title: 'Publicado', total: data?.totalPublished ?? 0 },
        { title: 'Documentos', total: data?.totalDocuments ?? 0 }
    ];

    const table = useReactTable({
        data: finalData,
        // @ts-expect-error
        columns,
        state: {
            rowSelection,
            pagination,
            columnFilters: columnFilters,
            columnVisibility: {
                ...columnVisibles
            }
        },
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        onPaginationChange: index => setPagination(index)
    });

    useEffect(() => {
        if (isLoading === false) {
            setIndicatorLoading(false);
        }
    }, [isLoading]);

    if (error) {
        return renderErrorComponent(error);
    }

    const handleSwitchDocument = (isPublished: boolean, visibility: boolean) => {
        setColumnFilters([{ id: 'isPublished', value: isPublished }]);
        setColumnVisibles({ ...columnVisibles, id: visibility });
        setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
        <main className='!min-w-[70vw] md:pl-16 mx-auto mt-5'>
            <section className='relative max-w-[85vw] !min-w-[85vw]'>
                {isLoading && <SplashLoader className='!bg-white-default' />}
                {docSelectedIsOpen && (
                    <DocumentDrawer
                        docSelectedIsOpen={docSelectedIsOpen}
                        setDocSelectedIsOpen={setDocSelectedIsOpen}
                        // @ts-expect-error
                        refetchKnowledgeBase={refetchKnowledgeBase}
                    />
                )}

                <section>
                    <Button variant={'ghost'} className='text-xs' onClick={() => navigate(routes.documentBase.name)}>
                        <ArrowLeft />
                        Volver
                    </Button>
                    <section className='flex items-center gap-2'>
                        <HeaderDocument headerTitle='Nombre base de conocimiento:' />
                        <div>{!!data ? data.knowledgeBase.name : ''}</div>
                    </section>
                </section>

                <Divider className='m-1' />

                <section>
                    <Tabs defaultValue='pending-knowledge'>
                        <TabsList className='grid w-fit grid-cols-2 '>
                            <TabsTrigger value='pending-knowledge' disabled={isLoading} onClick={() => handleSwitchDocument(false, true)}>
                                Documentos pendientes
                            </TabsTrigger>
                            <TabsTrigger value='published-knowledge' disabled={isLoading} onClick={() => handleSwitchDocument(true, false)}>
                                Documentos publicados
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='pending-knowledge' className='text-xs'>
                            <GenericTableHeaderWithIndicators
                                table={table}
                                // @ts-expect-error
                                data={data}
                                indicators={indicators}
                                indicatorLoading={indicatorLoading}
                                setMassiveConfigurationIsOpen={setMassiveConfigurationIsOpen}
                                refetch={refetchKnowledgeBase}
                            />
                            <main>
                                {/**@ts-expect-error */}
                                <TableKnowledgeBase table={table} columns={columns} />
                                <PaginatorKnowledgeBase table={table} />
                            </main>
                        </TabsContent>
                        <TabsContent value='published-knowledge' className='text-xs'>
                            <GenericTableHeaderWithIndicators
                                table={table}
                                // @ts-expect-error
                                data={data}
                                indicators={indicators}
                                indicatorLoading={indicatorLoading}
                                showMassiveButton={false}
                            />

                            <main>
                                {/**@ts-expect-error */}
                                <TableKnowledgeBase table={table} columns={columns} />
                                <PaginatorKnowledgeBase table={table} />
                            </main>
                        </TabsContent>
                    </Tabs>
                </section>
                {massiveConfigurationIsOpen && (
                    <MassiveDocumentsConfiguration
                        massiveDocumentsIsOpen={massiveConfigurationIsOpen}
                        setMassiveConfigurationIsOpen={setMassiveConfigurationIsOpen}
                        // @ts-expect-error
                        documents={table.getFilteredSelectedRowModel().rows}
                        setRowSelection={setRowSelection}
                        knowledgeBase={knowledgeBase}
                        refetchKnowledgeBase={refetchKnowledgeBase}
                    />
                )}
            </section>
        </main>
    );
}
