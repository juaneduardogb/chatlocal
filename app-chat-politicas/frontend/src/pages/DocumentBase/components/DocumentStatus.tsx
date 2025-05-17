import { useMemo } from 'react';

interface IDocumentStatus {
    statusName: string;
}

export const allStatuses = ['Publicado', 'Revisión en proceso', 'Revisión pendiente'];

function DocumentStatusSelector({ statusName }: IDocumentStatus) {
    const element = useMemo(() => {
        switch (statusName) {
            case 'No publicado':
                return (
                    <div className='rounded-full bg-[#EB8C0026] text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-[#EB8C00] animate-ping'></div>
                        {statusName}
                    </div>
                );
            case 'Publicado':
                return (
                    <div className='rounded-full bg-[#4EB52326] text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-[#4EB523]'></div>
                        {statusName}
                    </div>
                );
            case 'Procesado':
                return (
                    <div className='rounded-full bg-[#4EB52326] text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-[#4EB523]'></div>
                        {statusName}
                    </div>
                );
            case 'Revisión en proceso':
                return (
                    <div className='rounded-full bg-[#FFCA6426] text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-[#FFCA64] animate-ping'></div>
                        {statusName}
                    </div>
                );
            case 'Revisión pendiente':
                return (
                    <div className='rounded-full bg-[#33333326] text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-[#7D7D7D]'></div>
                        {statusName}
                    </div>
                );
            case 'Error de proceso':
                return (
                    <div className='rounded-full bg-red-200 text-xs px-2 py-1 text-center flex items-center gap-2 font-medium select-none'>
                        <div className='rounded-full w-2 h-2 bg-red-800'></div>
                        {statusName}
                    </div>
                );

            default:
                return <span>Estado desconocido</span>;
        }
    }, [statusName]);

    return <div>{element}</div>;
}

export default DocumentStatusSelector;
