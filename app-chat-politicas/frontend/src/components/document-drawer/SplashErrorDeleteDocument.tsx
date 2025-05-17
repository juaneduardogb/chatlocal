import { CloudOff } from 'lucide-react';

export default function SplashErrorDeleteDocument() {
    return (
        <div className='absolute top-0 w-full h-[100%] bg-white z-[800] flex items-center justify-center select-none cursor-not-allowed !min-h-[80vh]'>
            <div className='flex flex-col items-center gap-y-5 text-xs text-center md:text-lg lg:text-lg text-red-500'>
                <CloudOff size={80} />
                <p>No fue posible eliminar el documento, vuelve a intentarlo más tarde.</p>
            </div>
        </div>
    );
}
