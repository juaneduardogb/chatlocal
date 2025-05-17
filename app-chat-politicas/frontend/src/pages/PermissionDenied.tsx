import { Button } from '@heroui/react';
import { LockKeyhole, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import routes from '@/constants/routes';

/**
 * Permission Denied page shown when a user tries to access a route they don't have permission for
 */
const PermissionDenied = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4'>
            <div className='max-w-md text-center'>
                <LockKeyhole className='w-16 h-16 mx-auto mb-6 text-red-500' />

                <h1 className='text-3xl font-bold mb-4'>Acceso Denegado</h1>

                <p className='text-xl mb-6'>No tienes los permisos necesarios para acceder a esta página.</p>

                <p className='mb-8 text-muted-foreground'>
                    Si crees que esto es un error, contacta al administrador del sistema para solicitar acceso.
                </p>

                <Link to={routes.chat.name} className='flex items-center justify-center '>
                    <Button className='flex items-center gap-2'>
                        <Home size={18} />
                        <span>Volver al Inicio</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default PermissionDenied;
