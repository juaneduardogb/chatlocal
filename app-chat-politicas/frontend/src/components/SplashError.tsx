import { CloudOff } from 'lucide-react';

export default function SplashError() {
    return (
        <div className='absolute top-0 w-full h-[600px] bg-white-default z-[2] flex items-center justify-center select-none cursor-not-allowed'>
            <div className='flex flex-col items-center gap-y-5 text-xs text-center md:text-lg lg:text-lg text-red-500'>
                <CloudOff size={80} />
                <p>No fue posible consultar la información, vuelve a intentarlo más tarde.</p>
            </div>
        </div>
    );
}
