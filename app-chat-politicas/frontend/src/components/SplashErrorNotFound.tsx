import { CloudOff } from 'lucide-react';

export default function SplashErrorNotFound() {
    return (
        <div className='absolute top-0 w-full h-[100%] bg-white-default flex items-center justify-center select-none cursor-not-allowed'>
            <div className='flex flex-col items-center gap-y-5 text-xs text-center md:text-lg lg:text-lg text-red-500'>
                <CloudOff size={80} />
                <p>No se han encontrado registros con la información solicitada.</p>
            </div>
        </div>
    );
}
