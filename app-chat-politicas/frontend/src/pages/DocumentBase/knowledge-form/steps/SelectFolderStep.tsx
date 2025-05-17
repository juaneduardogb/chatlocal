import { Button } from '@heroui/button';
import { Divider } from 'antd';
import { ArrowRightIcon, FileText, Folder, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentFormStore } from '@/store/document/document.store';

interface ISelectFolderStepProps {
    setCurrentStepInForm: React.Dispatch<React.SetStateAction<'knowledge-configuration' | 'knowledge-name' | 'select-folder'>>;
    updateStatusModalUKB: () => void;
}

export default function SelectFolderStep({ setCurrentStepInForm, updateStatusModalUKB }: ISelectFolderStepProps) {
    const [tempFiles, setFiles] = useState<File[]>([]);

    const { files, saveFiles, clear } = useDocumentFormStore(state => state);

    const onDrop = (acceptedFiles: File[]) => {
        setFiles(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })));
        saveFiles(acceptedFiles);
    };
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        }
    });

    useEffect(() => {
        if (!!files) {
            setFiles([...tempFiles, ...files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))]);
        }
    }, []);

    const handleClickRemoveFile = (file: File) => {
        if (!!files) {
            // @ts-expect-error
            const allFileToUpload = files.filter(fileCurrentLoaded => fileCurrentLoaded.preview !== file.preview);

            const newFiles = [...allFileToUpload.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))];
            setFiles(newFiles);
            saveFiles(newFiles);
        }
    };

    return (
        <section className='relative pt-4 text-center grid gap-4'>
            <p className='py-2'>Debes arrastrar la carpeta que contiene los documentos que requiere cargar:</p>
            <div className='w-full'>
                <div
                    {...getRootProps({ className: 'dropzone' })}
                    className='justify-self-center p-1 rounded-md flex gap-2 text-center items-center justify-center max-w-[60%] min-w-[60%]  text-foreground h-40 border !text-lg cursor-pointer gradient-border relative xs:min-w-full bg-container_prompt_area'
                >
                    <input {...getInputProps()} /> <Folder /> Arrastrar o seleccionar carpeta
                </div>
            </div>

            {tempFiles.length > 0 && (
                <>
                    <p>Total de documentos: {tempFiles.length} </p>
                    <ScrollArea className='max-h-[20vh]'>
                        {tempFiles.map((file, index) => (
                            <div className='bg-rose-400/10 p-3 rounded-md flex justify-between items-center my-2' key={index}>
                                <div className='flex gap-2 items-center'>
                                    <FileText />
                                    {file.name}
                                </div>
                                <Trash className='cursor-pointer' fontWeight={100} size={15} onClick={() => handleClickRemoveFile(file)} />
                            </div>
                        ))}
                    </ScrollArea>
                </>
            )}

            <Divider className='mb-1' />
            <footer className='flex justify-end gap-4 p-0'>
                <Button
                    color='danger'
                    variant='bordered'
                    onPress={() => {
                        clear();
                        updateStatusModalUKB();
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant='solid'
                    color='primary'
                    isDisabled={tempFiles.length === 0}
                    onPress={() => setCurrentStepInForm('knowledge-name')}
                    endContent={<ArrowRightIcon />}
                >
                    Siguiente
                </Button>
            </footer>
        </section>
    );
}
