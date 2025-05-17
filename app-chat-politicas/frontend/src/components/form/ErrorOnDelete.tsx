import { FileWarningIcon } from 'lucide-react';

export default function ErrorOnDelete() {
    return (
        <div className='w-full h-full absolute top-0 left-0 bg-white/90 rounded-lg select-none'>
            <section className='h-full flex justify-center items-center font-bold'>
                <div className='flex flex-col items-center gap-y-4'>
                    <FileWarningIcon size={40} />
                    <p className='text-lg'>Ha ocurrido un error.</p>
                </div>
            </section>
        </div>
    );
}
