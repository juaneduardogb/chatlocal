import { Button, Input } from '@heroui/react';
import { Tooltip } from 'antd';
import { Info, X } from 'lucide-react';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import LabelsTag from './LabelsTag';

import { toast } from '@/hooks/useToast';
import { TagsElements } from '@/types/documents';

type LabelsCustomByAuthorProps = {
    tagsByAuthor: TagsElements[] | null;
    setTagsByAuthor: React.Dispatch<React.SetStateAction<TagsElements[] | null>>;
};

export default function LabelsCustomByAuthor({ tagsByAuthor, setTagsByAuthor }: LabelsCustomByAuthorProps) {
    const refInputTagByAuthor = useRef<HTMLInputElement | null>(null);

    const removeTagByAuthor = (tagId: string) => {
        const allDistinctTags = tagsByAuthor?.filter(tag => tag.id !== tagId);

        if (!!allDistinctTags) {
            setTagsByAuthor([...allDistinctTags]);
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
            <p className='flex gap-2 items-center md:text-lg font-bold'>
                Registrar etiquetas para distinguir y describir uso de los documentos
                <Tooltip title='Puedes ingresar etiquetas personalizadas a modo de categorizar la base de conocimiento.'>
                    <Info size={15} />
                </Tooltip>
            </p>
            <p className='text-xs'>
                Escriba palabras que identifiquen características de los documentos, por ejemplo: beneficios, políticas, cumpleaños, etc. El
                objetivo es que estas palabras clave sean útiles para filtrar y buscar documentos.
            </p>
            <div className='w-full flex justify-between items-center'>
                <div className='w-[80%]'>
                    <Input placeholder='Digitar atributo' ref={refInputTagByAuthor} />
                </div>
                <Button
                    variant='light'
                    color='primary'
                    onClick={() => handleAddNewTag(refInputTagByAuthor, tagsByAuthor, setTagsByAuthor)}
                    type='button'
                >
                    Añadir
                </Button>
            </div>
            <section className='flex gap-3 flex-wrap'>
                {!!tagsByAuthor &&
                    tagsByAuthor.map((tag, index) => (
                        <LabelsTag
                            key={index}
                            tag={tag}
                            customRemove={
                                <X size={20} strokeWidth={1} className='cursor-pointer' onClick={() => removeTagByAuthor(tag.id)} />
                            }
                        />
                    ))}
            </section>
        </>
    );
}
