import { LoaderCircleIcon } from 'lucide-react';

import { cn } from '@/utilities/utils';

interface ISplashLoader {
    splashText?: string;
    className?: string;
}
export default function SplashLoader({ splashText, className }: ISplashLoader) {
    if (splashText === null || splashText === undefined) {
        splashText = 'Consultando información...';
    }
    return (
        <div
            className={cn(
                'absolute top-0 w-full h-[100%] bg-white flex items-center justify-center select-none cursor-wait !min-h-[80vh]',
                className
            )}
        >
            <div className='flex flex-col items-center gap-y-5 animate-pulse text-xs text-center md:text-lg lg:text-lg'>
                <LoaderCircleIcon className='animate-spin' size={80} />
                <p>{splashText}</p>
            </div>
        </div>
    );
}
