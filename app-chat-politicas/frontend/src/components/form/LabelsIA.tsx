import { Button, Input } from '@heroui/react';
import { Tooltip } from 'antd';
import { Info, X } from 'lucide-react';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import LabelsTag from './LabelsTag';

import { toast } from '@/hooks/useToast';
import { TagsElements } from '@/types/documents';

type LabelsIAProps = {
    tagsIA: TagsElements[] | null;
    setTagsIA: React.Dispatch<React.SetStateAction<TagsElements[] | null>>;
};

export default function LabelsIA({ tagsIA, setTagsIA }: LabelsIAProps) {
    const refInputTagIA = useRef<HTMLInputElement | null>(null);

    const removeTagIA = (tagId: string) => {
        const allDistinctTags = tagsIA?.filter(tag => tag.id !== tagId);

        if (!!allDistinctTags) {
            setTagsIA([...allDistinctTags]);
        }
    };

    const handleAddNewTag = (
        tempRef: React.MutableRefObject<HTMLInputElement | null>,
        tags: TagsElements[] | null,
        tempSetTag: (value: React.SetStateAction<TagsElements[] | null>) => void
    ) => {
        if (!!tempRef && !!tags) {
            // @ts-expect-error
            const results = tags.filter(tag => tag.label === tempRef.current.value);
            if (results.length >= 1) {
                toast({
                    title: '¡Notificación!',
                    description: 'No es posible añadir un tag ya existente.',
                    className: 'mt-20 md:mt-0',
                    duration: 5000,
                    variant: 'destructive'
                });
                // @ts-expect-error
            } else if (tempRef.current.value.trim().length >= 1) {
                tempSetTag([
                    ...tags,
                    // @ts-expect-error
                    { label: tempRef.current.value, id: uuidv4().toLocaleUpperCase() }
                ]);
                // @ts-expect-error
                tempRef.current.value = null;
            }
            return;
            // @ts-expect-error
        } else if (!!tempRef && tempRef.current.value.trim().length >= 1) {
            // @ts-expect-error
            tempSetTag([{ label: tempRef.current.value, id: uuidv4().toLocaleUpperCase() }]);
            // @ts-expect-error
            tempRef.current.value = null;
            return;
        }
    };

    return (
        <>
            <p className='flex gap-2 items-center font-bold md:text-lg'>
                Ingrese palabras clave para que la IA busque información en los documentos
                <Tooltip title='Puedes solicitar atributos para que la IA identifique y asocie al documento. En el caso que la IA no los encuentre, informará y no los añadirá a la solicitud.'>
                    <Info size={15} />
                </Tooltip>
            </p>
            <p className='text-xs'>Por ejemplo: Personas, link de interés, fechas, etc.</p>
            <div className='w-full flex justify-between items-center'>
                <div className='w-[80%]'>
                    <Input placeholder='Digitar atributo' ref={refInputTagIA} />
                </div>
                <Button variant='light' color='primary' onPress={() => handleAddNewTag(refInputTagIA, tagsIA, setTagsIA)} type='button'>
                    Añadir
                </Button>
            </div>
            <section className='flex gap-3 flex-wrap'>
                {!!tagsIA &&
                    tagsIA.map((tag, index) => (
                        <LabelsTag
                            key={index}
                            tag={tag}
                            customRemove={<X size={20} strokeWidth={1} className='cursor-pointer' onClick={() => removeTagIA(tag.id)} />}
                        />
                    ))}
            </section>
        </>
    );
}
