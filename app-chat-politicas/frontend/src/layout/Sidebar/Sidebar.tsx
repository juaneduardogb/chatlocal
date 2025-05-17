import { AppStoreState, useAppStore } from '@/store/app';
import { ChevronLeft, FileText, Home, LucideProps, MessageCircle } from 'lucide-react';

import ChatSidebar from '@/layout/Sidebar/ChatSidebar';
import { IPublicClientApplication } from '@azure/msal-browser';
import { Link } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { ThemeSwitcher } from '@/components/header/ThemeSwitcher';
import { motion } from 'framer-motion';
import routes from '@/constants/routes';
import { useEffect } from 'react';
import { useInstance } from 'package_entra_id';
import { useMediaQuery } from '@uidotdev/usehooks';
import useUserPermissions from '@/hooks/app/useUserPermissions';
import useUserPhoto from '@/hooks/app/useUserPhoto';

interface SidebarProps {
    setSidebarOpen: (open: boolean) => void;
    sidebarOpen: boolean;
}

interface MenuItem {
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
    text: string;
    path: string;
    disabled?: boolean;
    permissionCheck?: () => boolean;
}

export default function Sidebar({ setSidebarOpen, sidebarOpen }: SidebarProps) {
    const { userPhoto, userName, setUserPhoto, setUserName, token } = useAppStore((state: AppStoreState) => state);
    const {
        isLoading: permissionsLoading,
        canAccessKnowledgeBase,
        canAccessDocuments,
        canAccessChat,
        fetchUserPermissions
    } = useUserPermissions();

    // Define menu items with permission checks
    const menuItems: MenuItem[] = [
        {
            icon: Home,
            text: 'Operation Hub',
            path: '/chatia',
            disabled: false,
            permissionCheck: canAccessDocuments
        },
        {
            icon: MessageCircle,
            text: 'Chat interno',
            path: '/chatia',
            disabled: false,
            permissionCheck: canAccessChat
        },
        {
            icon: FileText,
            text: 'Base de conocimientos',
            path: routes.documentBase.name,
            disabled: false,
            permissionCheck: canAccessKnowledgeBase
        }
    ];

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
    const isLargeDevice = useMediaQuery('only screen and (min-width : 769px) ');

    const instance: IPublicClientApplication = useInstance() as unknown as IPublicClientApplication;
    const account = instance.getActiveAccount();

    // Fetch user photo and name
    useEffect(() => {
        useUserPhoto(instance, account)
            .then(result => {
                setUserPhoto(result.photoUrl);
                setUserName(account?.name ?? '');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    // Fetch user permissions in the layout when token is available
    useEffect(() => {
        if (token && !permissionsLoading) {
            fetchUserPermissions();
        }
    }, [token, fetchUserPermissions, permissionsLoading]);

    const renderSkeletonMenuItem = (index: number) => (
        <li key={`skeleton-${index}`} className='mx-1 relative'>
            <div className={`flex items-center px-2 py-2 text-sm ${sidebarOpen ? 'justify-left w-84' : 'justify-center'}`}>
                <Skeleton className='w-4 h-4 rounded-full' />
                {sidebarOpen && <Skeleton className='ml-2 w-20 h-4' />}
            </div>
        </li>
    );

    const renderMenuItem = (item: MenuItem, isMobile = false) => {
        // If permissionCheck is a function, use it to determine if we should render
        // If no permissionCheck is provided, always render the item
        if (typeof item.permissionCheck === 'function' && !item.permissionCheck()) {
            return null;
        }

        return (
            <li key={item.text} className='mx-1 relative'>
                <Link
                    to={item.disabled ? '#' : item.path}
                    className={`flex items-center px-2 py-2 text-sm ${isMobile ? 'mb-1' : ''} ${
                        sidebarOpen ? 'justify-left w-84' : 'justify-center'
                    } hover:bg-black/5 rounded-full`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                >
                    <item.icon className='w-4 h-4' />
                    <span className={`ml-2 ${!sidebarOpen && 'hidden'} `}>{item.text}</span>
                </Link>
            </li>
        );
    };

    const sidebarContent = (isMobile = false) => (
        <>
            <ul className='my-3 bg-container_menu p-3 rounded-lg mx-4 mt-16'>
                {permissionsLoading
                    ? Array(3)
                          .fill(0)
                          .map((_, i) => renderSkeletonMenuItem(i))
                    : menuItems.map((item: MenuItem) => renderMenuItem(item, isMobile))}
            </ul>
        </>
    );

    return (
        <>
            {/* Sidebar for desktop */}
            {isLargeDevice && (
                <div className='relative'>
                    <div
                        className={`${sidebarOpen ? 'w-72 sidebar-open' : 'w-24'} absolute z-[1000] inset-0 !min-h-[100vh] h-full transition-width duration-700 ease-in-out bg-background overflow-hidden`}
                        style={{ position: 'fixed' }}
                    >
                        {sidebarContent()}
                        <ChatSidebar sidebarOpen={sidebarOpen} />

                        <section className={`absolute bottom-5 ${sidebarOpen ? 'w-full px-4' : 'w-24 px-2'} gap-y-6 `}>
                            <ThemeSwitcher />
                            {/* <HelpMenu sidebarOpen={sidebarOpen} /> */}
                            <div
                                className={`flex w-full ${!sidebarOpen && 'justify-center'} items-center px-3 mt-3 gap-3 select-none min-h-[20px] min-w-[40px]`}
                            >
                                <Skeleton
                                    className='rounded-full min-w-8 min-h-8 max-w-8 max-h-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]'
                                    isLoaded={!!userPhoto}
                                >
                                    {!!userPhoto && <img src={userPhoto} className='rounded-full min-w-8 max-w-8 ' />}
                                </Skeleton>
                                <span className={`text-xs min-w-[120px] ${!sidebarOpen && 'hidden'}`}>{userName}</span>
                            </div>
                        </section>
                    </div>
                    {sidebarOpen && (
                        <div
                            className={`${sidebarOpen ? 'justify-start left-[18rem]' : 'w-24 justify-center'} absolute top-2/4 flex z-[1000]`}
                        >
                            <motion.div className='' initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                <ChevronLeft
                                    size={60}
                                    strokeWidth={0.8}
                                    className='opacity-40 cursor-pointer text-foregroundhover:scale-80'
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                />
                            </motion.div>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile sidebar */}
            {isSmallDevice && sidebarOpen && (
                <div className='relative z-[10000] bg-background'>
                    <motion.div initial={{ x: -200 }} animate={{ x: 0 }} className='bg-background'>
                        <div className={'bg-background  w-72 absolute inset-0 !min-h-[100vh] transition-width duration-700 ease-in-out '}>
                            <div className=''>{sidebarContent(false)}</div>
                            <ChatSidebar sidebarOpen={sidebarOpen} />

                            <section className={`absolute bottom-5 left-3 ${sidebarOpen && 'w-[80%]'} gap-y-6`}>
                                <ThemeSwitcher />
                                {/* <button className='w-full'>
                                    <HelpMenu sidebarOpen={sidebarOpen} />
                                </button> */}
                                <div
                                    className={`flex w-full ${!sidebarOpen && 'justify-center'} items-center px-3 mt-3 gap-3 select-none min-h-[20px] min-w-[40px]`}
                                >
                                    <Skeleton
                                        className='rounded-full min-w-8 min-h-8 max-w-8 max-h-8 drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]'
                                        isLoaded={!!userPhoto}
                                    >
                                        {!!userPhoto && <img src={userPhoto} className='rounded-full min-w-8 max-w-8 ' />}
                                    </Skeleton>
                                    <span className={`text-xs min-w-[120px] ${!sidebarOpen && 'hidden'}`}>{userName}</span>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
