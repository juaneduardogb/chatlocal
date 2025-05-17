import { useQuery } from '@tanstack/react-query';
import { Form, FormInstance, Select } from 'antd';
import { useEffect, useState } from 'react';

import { useWorkers } from '@/hooks/app/useWorkers';
import { FormFields } from '@/types/documents';

interface ISupportSection {
    form: FormInstance<unknown>;
}

export default function SupportSection({ form }: ISupportSection) {
    const { data, isLoading, isSuccess } = useQuery({ queryKey: ['workers'], queryFn: useWorkers });

    const [options, setOptions] = useState<
        {
            label: string;
            value: string;
        }[]
    >();

    useEffect(() => {
        const defaultValues: FormFields = form.getFieldsValue() as unknown as FormFields;

        const requirePreviousData = !!defaultValues.supportPersons;

        if (!!requirePreviousData && isSuccess) {
            /**
             * Se busca obtener cuales son los owners
             * seleccionados a través del initial values,
             * una vez obtenidos se limpia la data para lograr
             * dejar los owners en el componente ya seleccionados.
             */
            let allPreviousWorkers = defaultValues.supportPersons;

            const allEmployeIds = allPreviousWorkers.map(worker => {
                const employeeId = JSON.parse(worker.value)['employeeId'];
                return employeeId;
            });

            let allValuesFromFetch = data
                // @ts-expect-error
                .filter((worker: { [key: string]: string | number }) => allEmployeIds.includes(parseInt(worker['employeeId'])) === false)
                .map((worker: { [key: string]: string | number }) => ({
                    label: worker['worker'],
                    value: JSON.stringify({
                        name: worker['worker'],
                        email: worker['workEmail'],
                        employeeId: worker['employeeId']
                    }),
                    key: worker['employeeId']
                }));
            allValuesFromFetch = [...allValuesFromFetch, ...allPreviousWorkers];

            setOptions(allValuesFromFetch);
        } else {
            /**
             * Acá se rellena el select de owners directamente con
             * toda la data del api de workers
             */
            if (isSuccess) {
                const allValuesFromFetch = data.map((worker: { [key: string]: string | number }) => ({
                    label: worker['worker'],
                    value: JSON.stringify({
                        name: worker['worker'],
                        email: worker['workEmail'],
                        employeeId: worker['employeeId']
                    }),
                    key: worker['employeeId']
                }));

                setOptions(allValuesFromFetch);
            }
        }
    }, [isSuccess, isLoading]);

    return (
        <div className='w-full grid gap-y-3'>
            <div className='md:text-lg font-bold'>Personas encargadas del soporte y mantención de los documentos</div>
            <div>Buscar y seleccionar usuarios *</div>
            <Form.Item name='supportPersons' rules={[{ required: true, message: 'Este campo es requerido.' }]}>
                <Select
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={options}
                    className='min-w-[100%] mt-2'
                    placeholder='Seleccionar'
                    size='middle'
                    mode='multiple'
                    showSearch
                    allowClear
                    disabled={data === null || data === undefined || data.length < 1}
                    loading={isLoading}
                />
            </Form.Item>
        </div>
    );
}
