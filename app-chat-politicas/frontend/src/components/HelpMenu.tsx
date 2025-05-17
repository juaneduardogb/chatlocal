import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { CircleHelp, MessageCircleQuestion, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HelpMenuProps {
    sidebarOpen: boolean;
}
export default function HelpMenu({ sidebarOpen }: HelpMenuProps) {
    const navigate = useNavigate();

    return (
        <Popover placement='right'>
            <PopoverTrigger>
                <Button
                    variant='bordered'
                    startContent={<CircleHelp strokeWidth={1} />}
                    disableAnimation
                    className={`${!sidebarOpen ? 'justify-center' : 'justify-start'} w-full `}
                >
                    {sidebarOpen && 'Ayuda y soporte'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='bg-container_menu text-foreground pt-2 gap-y-2 text-xs content-start'>
                <p className='font-medium select-none px-1 justify-start text-left w-full pb-2'>Páginas</p>
                <Button
                    variant='bordered'
                    className='p-0 px-1 justify-start w-full text-foreground bg-trasparent'
                    size='sm'
                    startContent={<MessageCircleQuestion strokeWidth={1} size={18} />}
                >
                    Preguntas frecuentes (FAQ)
                </Button>
                <Button
                    variant='bordered'
                    className='p-0 px-1 justify-start w-full text-foreground'
                    size='sm'
                    startContent={<Rocket strokeWidth={1} size={18} />}
                >
                    Versiones
                </Button>
            </PopoverContent>
        </Popover>
    );
}
