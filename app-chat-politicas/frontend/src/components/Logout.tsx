import { LogOut } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export default function Logout() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className='border-black/230 border text-black font-medium rounded-full p-3 text-xs cursor-pointer w-full'>JG</div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-fit mt-3 mx-5 '>
                <DropdownMenuItem className='cursor-pointer'>
                    <LogOut />
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
