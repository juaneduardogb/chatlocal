import { LoaderCircleIcon } from 'lucide-react';

export default function LoadingSpin() {
    return (
        <div className='w-full h-full absolute top-0 left-0 bg-white/70 rounded-lg select-none'>
            <section className='h-full flex justify-center items-center font-bold'>
                <div className='flex flex-col items-center gap-y-4'>
                    <LoaderCircleIcon className='animate-spin' size={40} />
                    <p className='text-lg'>Procesando</p>
                </div>
            </section>
        </div>
    );
}
