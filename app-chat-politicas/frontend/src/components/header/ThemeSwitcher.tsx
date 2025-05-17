import { Button } from '@heroui/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Sun, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const [sidebarOpen, _] = useLocalStorage('sidebar-main-open', false);

    return (
        <Button
            onPress={() => setTheme(theme?.trim() === 'light' ? 'dark' : 'light')}
            variant='bordered'
            size='md'
            className='py-1'
            disableAnimation
        >
            {theme?.trim() === 'light' ? <SunMoon /> : <Sun />}
            {sidebarOpen ? (theme?.trim() === 'light' ? 'Modo Oscuro' : 'Modo claro') : ''}
        </Button>
    );
}
