import { ClearOutlined } from '@ant-design/icons';
import { Button } from '@heroui/button';
import { ColumnFiltersState, Table } from '@tanstack/react-table';
import { Divider, message } from 'antd';
import { RotateCcwIcon, SearchCheck } from 'lucide-react';
import React from 'react';

import TableIndicator from '@/pages/DocumentBase/components/TableIndicator';
import { TableIndicatorType } from '@/types/documents';

interface GenericTableHeaderWithIndicatorsProps {
    table: Table<Document>;
    indicators: TableIndicatorType[];
    indicatorLoading: boolean;
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    defaultDocStatus: 'Revisión pendiente' | 'Publicado';
    setMassiveConfigurationIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refetch: unknown;
    showMassiveButton?: boolean;
}
function GenericTableHeaderWithIndicators({
    table,
    indicators,
    indicatorLoading,
    setColumnFilters,
    defaultDocStatus,
    setMassiveConfigurationIsOpen,
    showMassiveButton = true,
    refetch
}: GenericTableHeaderWithIndicatorsProps) {
    return (
        <>
            <header
                className={`flex gap-4 mb-4 ${showMassiveButton ? 'sm:justify-between' : 'xs:justify-center xs:grid xs:w-[80vw]'} items-center justify-between `}
            >
                <section className={`flex items-center mb-2 gap-3 xs:gap-3 xs:justify-center ${showMassiveButton ? 'xs:flex-wrap' : ''}`}>
                    <div className='flex gap-2'>
                        <Button
                            color='primary'
                            variant='bordered'
                            type='button'
                            className={`${!showMassiveButton && 'xs:self-end xs:mb-2 border-primary border-2'}`}
                            onPress={() => {
                                message.success('Se han limpiado los filtros.');
                                setColumnFilters([
                                    {
                                        id: 'status',
                                        value: defaultDocStatus
                                    }
                                ]);
                            }}
                            startContent={<ClearOutlined className='text-lg' />}
                        ></Button>
                        <Button
                            color='primary'
                            variant='bordered'
                            type='button'
                            onPress={() => {
                                // @ts-expect-error
                                refetch();
                                message.success('Se han actualizado los registros.');
                            }}
                            startContent={<RotateCcwIcon size={16} />}
                        ></Button>
                    </div>

                    <Divider type='vertical' className='h-10 xs:hidden' />
                    <TableIndicator indicators={indicators} isLoading={indicatorLoading} />
                </section>
                {showMassiveButton && (
                    <Button
                        color='primary'
                        variant='shadow'
                        isDisabled={table.getFilteredSelectedRowModel().rows.length === 0}
                        onPress={() => setMassiveConfigurationIsOpen(true)}
                    >
                        {table.getFilteredSelectedRowModel().rows.length} <Divider type='vertical' className='h-6 bg-white' />
                        <SearchCheck /> Revisar
                    </Button>
                )}
            </header>
        </>
    );
}
export default GenericTableHeaderWithIndicators;
