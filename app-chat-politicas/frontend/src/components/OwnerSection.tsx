import { Form, FormInstance, Select } from 'antd';
import React, { useEffect } from 'react';

import { allLineOfServiceOptions, lineOfServiceInformation } from '@/constants/generics';
import { useWorkers } from '@/hooks/app/useWorkers';
import { toast } from '@/hooks/useToast';

interface IOwnerSection {
    setSupportLoS: React.Dispatch<React.SetStateAction<string>>;
    supportLoS: string;
    form: FormInstance<unknown>;
    setSubLoSSelected: React.Dispatch<React.SetStateAction<string>>;
}

export default function OwnerSection({ setSupportLoS, supportLoS, form, setSubLoSSelected }: IOwnerSection) {
    const { data, error, isLoading } = useWorkers();

    const getAllSubLos = () => {
        if (!!supportLoS) {
            const allResults = Object.keys(lineOfServiceInformation[supportLoS]);

            const allSubLoS = allResults.map(result => lineOfServiceInformation[supportLoS][result]);
            return allSubLoS;
        } else {
            return [];
        }
    };

    useEffect(() => {
        if (!!error) {
            toast({
                title: 'Error al obtener listado de personas.',
                description: 'No fue posible consultar la información de las personas, vuelve a intentarlo más tarde.',
                variant: 'destructive',
                duration: 3000
            });
        }
    }, [error]);

    return (
        <section className='w-full grid gap-y-3'>
            <div className='md:text-lg font-bold'>Área responsable de los documentos</div>
            <section className='grid xs:grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2'>
                <div>
                    <div>LoS *</div>
                    <Form.Item name='losOwner' rules={[{ required: true, message: 'Este campo es requerido.' }]}>
                        <Select
                            options={allLineOfServiceOptions.filter(los => los !== 'xLoS').map(los => ({ label: los, value: los }))}
                            className='min-w-[100%] mt-2'
                            placeholder='Seleccionar'
                            onSelect={(value: string) => {
                                setSupportLoS(value);
                                form.resetFields(['subLoS', 'ownerPersons']);
                            }}
                            size='middle'
                            disabled={data === null || data === undefined || data.length < 1}
                        />
                    </Form.Item>
                </div>
                <div>
                    <div>SubLoS *</div>
                    <Form.Item name='subLoS' rules={[{ required: true, message: 'Este campo es requerido.' }]}>
                        <Select
                            options={!!supportLoS ? getAllSubLos().map(los => ({ label: los, value: los })) : []}
                            className='min-w-[100%] mt-2'
                            placeholder='Seleccionar'
                            size='middle'
                            disabled={!!supportLoS ? false : true}
                            showSearch
                            onSelect={(option: string) => {
                                setSubLoSSelected(option);
                                form.setFieldValue('subLoS', option);
                            }}
                        />
                    </Form.Item>
                </div>
            </section>
        </section>
    );
}
