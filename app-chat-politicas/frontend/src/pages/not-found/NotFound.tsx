import { Image } from '@heroui/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { logoWhite, logo } from '@/constants/generics';

export default function NotFound() {
    const { theme } = useTheme();
    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center'>
            <div className='animate-in fade-in slide-in-from-bottom-8 duration-700 ease-in-out'>
                <div className='mb-6 flex justify-center'>
                    <Image src={theme === 'dark' ? logoWhite : logo} alt='logo' />
                </div>

                <h2 className='mb-4 text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl'>Chat no encontrado</h2>

                <p className='mb-8 max-w-md text-muted-foreground'>
                    El chat que estás buscando parece que se ha perdido. Vamos a llevarte de vuelta a la página de inicio.
                </p>

                <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                    <Button asChild size='lg' className='gap-2'>
                        <Link to='/'>
                            <MessageSquare className='h-5 w-5' />
                            <span>Volver al chat</span>
                        </Link>
                    </Button>

                    <Button asChild variant='outline' size='lg' className='gap-2'>
                        <Link to='/'>
                            <ArrowLeft className='h-5 w-5' />
                            <span>Inicio</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
