import { Menu, MessageCirclePlus } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { logo, logoWhite } from '@/constants/generics';
import { useEffect, useMemo } from 'react';

import { AccountInfo } from '@azure/msal-browser';
import { Button } from '@heroui/button';
import { DeleteModal } from '@/pages/chat/components/Modals/DeleteModal';
import InactivityModal from '@/components/InactivityModal';
import { RenameModal } from '@/pages/chat/components/Modals/RenameModal';
import Sidebar from './Sidebar/Sidebar';
import routes from '@/constants/routes';
import { useChatActions } from '@/hooks/chat/useChatActions';
import { useChatStore } from '@/store/chat/chat.store';
import { useInstance } from 'package_entra_id';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useTheme } from 'next-themes';

export default function LayoutCustom() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebar-main-open', false);
    const { theme } = useTheme();
    const instance = useInstance();

    const {
        isRenameModalOpen,
        setIsRenameModalOpen,
        newTitle,
        setNewTitle,
        renameMutation,
        selectedChat,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        deleteMutation
    } = useChatActions();

    const scopes = useMemo(() => {
        return ['User.Read'];
    }, [instance]);

    const acquireSilent = async (account: AccountInfo) => {
        const result = await instance.acquireTokenSilent({
            account,
            scopes
        });
        return result;
    };

    useEffect(() => {
        const account = instance.getActiveAccount();
        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            const storageItems = localStorage;
            const tokenKey = Object.keys(storageItems).find(key => key.includes('accesstoken'));
            if (tokenKey !== undefined) {
                const credentials = JSON.parse(storageItems[tokenKey]);
                setInterval(
                    () =>
                        navigator.serviceWorker.controller?.postMessage({
                            type: 'CHECK_EXPIRATION',
                            data: credentials
                        }),
                    60000
                );
                navigator.serviceWorker.controller?.postMessage({
                    type: 'CHECK_EXPIRATION_LOADING',
                    data: credentials
                });
            }

            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'TOKEN_EXPIRED') {
                    // RUN REFRESH TOKEN
                    if (account !== undefined && account !== null) {
                        const result = acquireSilent(account);
                        result.then(resultado => instance.setActiveAccount(resultado.account));
                    }
                } else if (event.data.type === 'TOKEN_EXPIRED_LOADING') {
                    instance
                        .logout({
                            account: account
                        })
                        .catch(error => console.log('error', error));
                }
            });
        }
    }, []);

    return (
        <div className='h-screen justify-between items-center overflow-auto bg-background relative'>
            <header className='flex justify-between items-center px-6 py-3 border-b border-border fixed top-0 w-full z-[20000] backdrop-blur-2xl bg-transparent'>
                <div className='flex items-center'>
                    <Button
                        isIconOnly
                        variant='ghost'
                        onPress={() => setSidebarOpen(!sidebarOpen)}
                        aria-label='toggle Menu'
                        className='mr-4'
                    >
                        <Menu size={20} />
                    </Button>
                    <div className='flex items-center gap-2 !z-[100000]'>
                        <img alt='Logo' src={theme === 'dark' ? logoWhite : logo} className='w-15 h-10 origin-left transition-all ' />
                        <div className='flex items-center gap-2 text-sm'>
                            <div className='w-[1px] h-8 bg-gray-300 dark:bg-gray-600 mx-1'></div>
                            <p>Chat IA</p>
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant='bordered'
                        className='text-foreground flex items-center justify-center'
                        startContent={<MessageCirclePlus />}
                        onPress={() => {
                            // Explicitly clear messages before navigating to new chat
                            const chatStore = useChatStore.getState();
                            chatStore.clearMessages();
                            navigate(routes.chat.name, { replace: true, viewTransition: true });
                        }}
                    >
                        Nuevo chat
                    </Button>
                </div>
            </header>

            {/* Render modales directamente */}
            {isRenameModalOpen && (
                <RenameModal
                    isOpen={isRenameModalOpen}
                    onClose={() => setIsRenameModalOpen(false)}
                    title={newTitle}
                    setTitle={setNewTitle}
                    onRename={() => renameMutation.mutate({ chatId: selectedChat?.chatId || '', title: newTitle })}
                    isLoading={renameMutation.isPending}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={() => deleteMutation.mutate(selectedChat?.chatId || '')}
                    isLoading={deleteMutation.isPending}
                    chatTitle={selectedChat?.title || null}
                />
            )}

            <main className='flex relative h-screen overflow-hidden'>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <section
                    className='w-full grid pt-12 overflow-hidden z-[51]'
                    id='main-content'
                    style={{
                        marginLeft: sidebarOpen ? '72px' : '24px',
                        transition: 'margin-left 0.7s ease-in-out',
                        position: 'relative',
                        height: '100vh'
                    }}
                >
                    <Outlet />
                </section>
            </main>

            <InactivityModal />
        </div>
    );
}
