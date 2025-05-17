import { Button, Checkbox, CheckboxGroup, Input } from '@heroui/react';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { Column } from '@tanstack/react-table';
import { message } from 'antd';
import { FilterIcon, Search } from 'lucide-react';
import { memo, useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { allLineOfServiceOptions } from '@/constants/generics';
import { allStatuses } from '@/pages/DocumentBase/components/DocumentStatus';

function FilterColumns({ column }: { column: Column<unknown, unknown> }) {
    const columnFilterValue = column.getFilterValue();
    const { filterVariant } = column.columnDef.meta ?? {};

    const [inputColumnValue, setInputColumnValue] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    // const handleSelectChange = (value: string) => {
    //     if (!selectedOptions.includes(value)) {
    //         setSelectedOptions([...selectedOptions, value]);
    //     } else {
    //         setSelectedOptions(selectedOptions.filter(option => option !== value));
    //     }
    // };

    switch (filterVariant) {
        case 'select-status': {
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <div className='hover:bg-black/30 hover:text-white rounded-lg p-2 cursor-pointer'>
                            <FilterIcon size={15} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='w-fit'>
                        <Select
                            onValueChange={e => {
                                message.success('Se ha aplicado el filtro.');
                                column.setFilterValue(e.trim());
                            }}
                            value={columnFilterValue?.toString()}
                        >
                            <SelectTrigger className='w-[180px]'>
                                <SelectValue placeholder='Selecciona un estado' />
                            </SelectTrigger>
                            <SelectContent className='!z-[2000]'>
                                {allStatuses.map((statusName, index) => (
                                    <SelectItem value={statusName} key={index}>
                                        {statusName}
                                    </SelectItem>
                                ))}
                                <SelectItem value=' '>Todos</SelectItem>
                            </SelectContent>
                        </Select>
                    </PopoverContent>
                </Popover>
            );
        }
        case 'select-los': {
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <div className='hover:bg-black/30 hover:text-white rounded-lg p-2 cursor-pointer'>
                            <FilterIcon size={15} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent>
                        <CheckboxGroup
                            color='primary'
                            label='Seleccionar LoS'
                            value={selectedOptions}
                            onValueChange={setSelectedOptions}
                            className='w-[10rem] p-4'
                            size='sm'
                        >
                            {allLineOfServiceOptions.map(los => (
                                <Checkbox key={los} value={los}>
                                    {los}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                        <Button
                            className='w-full text-xs'
                            size={'sm'}
                            onPress={() => {
                                message.success('Se ha aplicado el filtro.');
                                column.setFilterValue(selectedOptions);
                            }}
                            disabled={selectedOptions.length < 1}
                            variant='faded'
                        >
                            <Search size={15} /> Buscar
                        </Button>
                    </PopoverContent>
                </Popover>
            );
        }
        case 'input': {
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <div className='hover:bg-black/30 hover:text-white rounded-lg p-2 cursor-pointer'>
                            <Search size={15} />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='w-fit'>
                        <p className='text-xs mb-2 font-medium'>Ingresa un valor a buscar: </p>
                        <section>
                            <Input onChange={e => setInputColumnValue(e.target.value.trim())} />
                            <Button
                                className='w-full mt-2 text-xs'
                                size={'sm'}
                                onPress={() => {
                                    toast('Notificación', {
                                        description: 'Se ha aplicado el filtro.',
                                        duration: 3000
                                    });
                                    column.setFilterValue(inputColumnValue);
                                }}
                            >
                                <Search size={15} /> Buscar
                            </Button>
                        </section>
                    </PopoverContent>
                </Popover>
            );
        }
    }
}

export default memo(FilterColumns);
