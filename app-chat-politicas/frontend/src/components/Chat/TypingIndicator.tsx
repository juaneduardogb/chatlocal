import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
    isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const interval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) {
                    return '';
                }
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className='flex items-center space-x-2 text-gray-500 p-2'>
            <div className='flex space-x-1'>
                <div className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '0ms' }}></div>
                <div className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '150ms' }}></div>
                <div className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className='text-sm'>Escribiendo{dots}</span>
        </div>
    );
}
