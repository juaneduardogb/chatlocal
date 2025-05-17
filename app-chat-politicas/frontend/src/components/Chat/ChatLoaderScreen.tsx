import { WhisperSpinner } from 'react-spinners-kit';

import TypingAnimation from '../ui/typing-animation';

export default function ChatLoaderScreen() {
    return (
        <main className='absolute inset-0 flex items-center justify-center bg-background z-50'>
            <div className='flex flex-col items-center gap-y-6'>
                <WhisperSpinner color='#d93954' frontColor='#d93954' backColor='#d93954' loading size={70} />
                <p className='mt-4 text-text_primary'>
                    <TypingAnimation className='text-primary font-semibold text-lg'>Cargando conversación...</TypingAnimation>
                </p>
            </div>
        </main>
    );
}
