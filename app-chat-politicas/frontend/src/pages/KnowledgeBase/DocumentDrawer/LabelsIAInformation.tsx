import { Accordion, AccordionItem } from '@heroui/react';

import { MetaDataExtracted } from '@/types/documents';

interface LabelsIAInformationProps {
    metaData: MetaDataExtracted[] | undefined;
}

export default function LabelsIAInformation({ metaData }: LabelsIAInformationProps) {
    return (
        !!metaData &&
        metaData.length >= 1 && (
            <Accordion variant='bordered' className='bg-container_menu' defaultExpandedKeys={['1']}>
                <AccordionItem
                    title={<span className='font-bold text-wrap'>Información extraída por IA</span>}
                    className='bg-container_menu rounded-lg'
                    key='1'
                >
                    <ul className='grid gap-y-1'>
                        {metaData.map((label, index) => (
                            <li key={index} className='border p-2 flex gap-3 bg-pink-600/10 rounded-md'>
                                <section className='min-w-[80px] font-bold'>{Object.keys(label)}</section>
                                <section className='grid grid-cols-1 w-full'>
                                    {Object.keys(label).map((value, index) => {
                                        return typeof label[value] === 'string' ? (
                                            <div className='w-full px-2 rounded-sm' key={index}>
                                                {label[value]}
                                            </div>
                                        ) : (
                                            label[value].map((value: unknown, index) => {
                                                const element = value as React.ReactNode;
                                                return (
                                                    <div className='w-full px-2 rounded-sm flex justify-between items-center' key={index}>
                                                        <p>{element}</p>
                                                    </div>
                                                );
                                            })
                                        );
                                    })}
                                </section>
                            </li>
                        ))}
                    </ul>
                </AccordionItem>
            </Accordion>
        )
    );
}
