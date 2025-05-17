import { CircleCheckBig } from 'lucide-react';

export default function SplashUpdateDocument() {
    return (
        <div className='absolute top-0 w-full h-[80vh] bg-white z-[800] flex items-center justify-center select-none cursor-not-allowed !min-h-[80vh]'>
            <div className='flex flex-col items-center gap-y-5 text-xs text-center md:text-lg lg:text-lg '>
                <CircleCheckBig size={80} />
                <p>Se ha actualizado correctamente el documento.</p>
            </div>
        </div>
    );
}
