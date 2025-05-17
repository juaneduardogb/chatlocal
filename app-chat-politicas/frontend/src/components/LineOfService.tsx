import { Form, Select } from 'antd';

import { allContractTypes, allLineOfServiceOptions, allProfilesOptions, allTypeOfWorkday } from '@/constants/generics';

export default function LineOfServiceDocuments() {
    return (
        <section className='w-full mt-5 grid gap-y-3'>
            <div className='text-lg font-bold'>Áreas y categorías que tendrán acceso a los documentos</div>
            <p className=''>Línea de servicio *</p>

            <Form.Item name='los' rules={[{ required: true, message: 'Este campo es requerido.' }]}>
                <Select
                    options={allLineOfServiceOptions.map(los => ({ label: los, value: los }))}
                    placeholder='Seleccionar'
                    mode='multiple'
                    size='middle'
                />
            </Form.Item>

            {/* Acceso por categoría */}

            <p className=''>Selección de cargo *</p>
            <Form.Item name='profile' rules={[{ required: true, message: 'Este campo es requerido.' }]}>
                <Select
                    options={allProfilesOptions.map(profile => ({ label: profile, value: profile }))}
                    placeholder='Seleccionar'
                    mode='multiple'
                    size='middle'
                />
            </Form.Item>

            <section className='grid xs:grid-cols-1 grid-cols-2 gap-4'>
                <Form.Item name='contractType' rules={[{ required: true, message: 'Este campo es requerido.' }]} label='Tipo de contrato'>
                    <Select
                        options={allContractTypes.map(contractType => ({ label: contractType, value: contractType }))}
                        placeholder='Seleccionar'
                        mode='multiple'
                        size='middle'
                    />
                </Form.Item>
                <Form.Item name='typeOfWorkday' rules={[{ required: true, message: 'Este campo es requerido.' }]} label='Tipo de jornada'>
                    <Select
                        options={allTypeOfWorkday.map(typeOfWorkday => ({ label: typeOfWorkday, value: typeOfWorkday }))}
                        placeholder='Seleccionar'
                        mode='multiple'
                        size='middle'
                    />
                </Form.Item>
            </section>
        </section>
    );
}
