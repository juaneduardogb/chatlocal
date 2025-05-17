import { Button, Divider, Popover, PopoverContent, PopoverTrigger, Skeleton, Tooltip } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowDownToLine,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    MessageSquare,
    MessageSquareOff,
    MoreVertical,
    PencilRuler,
    Pin,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ScrollArea } from '@/components/ui/scroll-area';
import routes from '@/constants/routes';
import { useUserChats } from '@/hooks/app/useUserChats';
import { ApiChatSession, useChatActions } from '@/hooks/chat/useChatActions';
import { useAppStore } from '@/store/app';

interface ChatSidebarProps {
    sidebarOpen: boolean;
}

// Definición de la interfaz para los botones de acción
interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isDanger?: boolean;
    isPrimary?: boolean;
}

// Componente ActionButton para reducir la redundancia en los botones de acción
const ActionButton = ({ icon, label, onClick, isDanger = false, isPrimary = false }: ActionButtonProps) => (
    <Button
        variant='bordered'
        className={`w-full justify-start px-1 mb-1 ${isDanger ? 'text-danger' : isPrimary ? 'bg-primary text-white rounded-lg' : ''}`}
        size='sm'
        startContent={icon}
        onPress={onClick}
    >
        {label}
    </Button>
);

export default function ChatSidebar({ sidebarOpen }: ChatSidebarProps) {
    const { data: chats, isLoading, error, refetch } = useUserChats();
    const { selectedChatId, pinnedChatId } = useAppStore();
    const [expandedSection, setExpandedSection] = useState('Hoy');
    const [expandedChats, setExpandedChats] = useState<{ [key: string]: boolean }>({});
    const queryClient = useQueryClient();

    const { togglePinChat, openRenameModal, openDeleteModal, downloadChat } = useChatActions();

    // Escuchar el evento personalizado chat-updated
    useEffect(() => {
        const handleChatUpdated = () => {
            console.log('Evento chat-updated detectado en el sidebar, refrescando datos...');
            // Forzar recarga de datos completa
            queryClient.invalidateQueries({ queryKey: ['userChats'] });
            refetch();
        };

        // Agregar el event listener
        window.addEventListener('chat-updated', handleChatUpdated);

        // Limpiar el event listener cuando el componente se desmonte
        return () => {
            window.removeEventListener('chat-updated', handleChatUpdated);
        };
    }, [refetch]);

    // Recargamos los chats cuando cambia el pinnedChatId o selectedChatId
    useEffect(() => {
        console.log(`State change detected: pinned=${pinnedChatId}, selected=${selectedChatId}`);
        refetch();
    }, [pinnedChatId, selectedChatId, refetch]);

    // Function to sort chats - pinned chat first with better error handling
    const sortChats = (chatList: ApiChatSession[] = []): ApiChatSession[] => {
        if (!chatList || !Array.isArray(chatList) || chatList.length === 0) {
            console.log('No chats to sort or invalid chat list');
            return [];
        }

        console.log(`Sorting ${chatList.length} chats. Pinned chat ID: ${pinnedChatId || 'none'}`);

        // Filtrar elementos inválidos para evitar errores
        const validChats = chatList.filter(chat => chat && typeof chat === 'object' && 'chatId' in chat && chat.chatId);

        if (validChats.length !== chatList.length) {
            console.warn(`Filtered out ${chatList.length - validChats.length} invalid chats`);
        }

        // Log each chat ID for debugging
        if (process.env.NODE_ENV === 'development') {
            validChats.forEach((chat, index) => {
                const isPinned = chat.chatId === pinnedChatId;
                const isSelected = chat.chatId === selectedChatId;
                console.log(
                    `Chat #${index}: ID=${chat.chatId}, title=${chat.title || 'no title'}, isPinned=${isPinned}, isSelected=${isSelected}`
                );
            });
        }

        // Hacer una copia para no modificar el original
        return [...validChats].sort((a, b) => {
            try {
                // Verificación más segura de IDs
                const chatIdA = a?.chatId?.toString() || '';
                const chatIdB = b?.chatId?.toString() || '';
                const pinnedId = pinnedChatId?.toString() || '';

                // Si hay un pin, asegurarse de que se compare correctamente
                const isPinnedA = !!pinnedId && chatIdA === pinnedId;
                const isPinnedB = !!pinnedId && chatIdB === pinnedId;

                // Pinned chat goes first
                if (isPinnedA && !isPinnedB) {
                    return -1;
                }
                if (!isPinnedA && isPinnedB) {
                    return 1;
                }

                // Verificar que las fechas son válidas
                let dateA: number;
                let dateB: number;

                try {
                    dateA = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                } catch {
                    console.warn(`Invalid date for chat ${chatIdA}:`, a?.updatedAt);
                    dateA = 0;
                }

                try {
                    dateB = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                } catch {
                    console.warn(`Invalid date for chat ${chatIdB}:`, b?.updatedAt);
                    dateB = 0;
                }

                // Si ambas fechas son inválidas, ordenar por ID como último recurso
                if (!dateA && !dateB) {
                    return chatIdA.localeCompare(chatIdB);
                }

                // Otherwise sort by most recent
                return dateB - dateA;
            } catch (error) {
                console.error('Error sorting chats:', error);
                return 0; // mantener el orden original en caso de error
            }
        });
    };

    // Toggle expanded state for chat sections
    const toggleExpandedChats = (sectionTitle: string) => {
        setExpandedChats(prev => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle]
        }));
    };

    // Toggle expanded state for section headers
    const toggleExpandedSection = (title: string) => {
        setExpandedSection(prevSection => (prevSection === title ? '' : title));
    };

    // Componente para el botón de mostrar más/menos
    const ShowMoreButton = ({ sectionTitle, count }: { sectionTitle: string; count: number }) => {
        const isExpanded = expandedChats[sectionTitle];
        return (
            <Tooltip content={isExpanded ? 'Mostrar menos' : 'Mostrar más'}>
                <button
                    className={`cursor-pointer p-1 ${sidebarOpen ? 'w-full' : 'w-8'} mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1`}
                    onClick={() => toggleExpandedChats(sectionTitle)}
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={14} />
                            {sidebarOpen && 'Mostrar menos'}
                        </>
                    ) : (
                        <>
                            <ChevronDown size={14} />
                            {sidebarOpen && `Ver ${count} más`}
                        </>
                    )}
                </button>
            </Tooltip>
        );
    };

    // Componente para el popover de acciones
    const ChatActionPopover = ({ chat }: { chat: ApiChatSession }) => {
        // Verificar que el chat es válido
        if (!chat || !chat.chatId) {
            console.error('Invalid chat provided to ChatActionPopover');
            return null;
        }

        const isPinned = chat.chatId === pinnedChatId;
        console.log(`Rendering actions for chat: ${chat.chatId}, isPinned: ${isPinned}`);

        const handleTogglePin = () => {
            console.log(`Toggle pin clicked for chat: ${chat.chatId}`);
            togglePinChat(chat.chatId);
        };

        const handleRename = () => {
            console.log(`Rename clicked for chat: ${chat.chatId}`);
            openRenameModal(chat);
        };

        const handleDownload = () => {
            console.log(`Download clicked for chat: ${chat.chatId}`);
            downloadChat(chat);
        };

        const handleDelete = () => {
            console.log(`Delete clicked for chat: ${chat.chatId}`);
            openDeleteModal(chat);
        };

        return (
            <Popover>
                <PopoverTrigger>
                    <MoreVertical size={12} className='text-muted-foregrounds cursor-pointer' />
                </PopoverTrigger>
                <PopoverContent className='bg-bg_popover w-48 p-2 rounded-md shadow-md border border-border'>
                    <ActionButton
                        icon={<Pin size={15} strokeWidth={1} className={isPinned ? 'text-white' : ''} />}
                        label={isPinned ? 'Desanclar' : 'Anclar'}
                        onClick={handleTogglePin}
                        isPrimary={isPinned}
                    />
                    <ActionButton icon={<PencilRuler size={15} strokeWidth={1} />} label='Renombrar' onClick={handleRename} />
                    <ActionButton icon={<ArrowDownToLine size={15} strokeWidth={1} />} label='Descargar' onClick={handleDownload} />
                    <Divider className='my-1' />
                    <ActionButton
                        icon={<Trash2 size={15} strokeWidth={1} className='text-danger' />}
                        label='Eliminar'
                        onClick={handleDelete}
                        isDanger
                    />
                </PopoverContent>
            </Popover>
        );
    };

    // Componente para cada item de chat
    const ChatItem = ({ chat }: { chat: ApiChatSession }) => {
        // Validación básica del chat
        if (!chat || !chat.chatId) {
            console.error('Invalid chat data provided to ChatItem');
            return null;
        }

        const chatId = chat.chatId;
        const isSelected = chatId === selectedChatId;
        const isPinned = chatId === pinnedChatId;

        // Log para depuración
        if (isSelected || isPinned) {
            console.log(`Rendering chat item: ${chatId}, isSelected: ${isSelected}, isPinned: ${isPinned}`);
        }

        // URL segura para el chat
        const chatUrl = routes.loadChat.create(chatId);

        return (
            <li className='mb-1 text-[0.8rem]' key={chatId} data-chat-id={chatId}>
                <div
                    className={`flex items-center justify-between py-1 ${sidebarOpen ? 'px-2' : ''} rounded-md ${isSelected ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                >
                    <Link to={chatUrl} className='flex-1 truncate'>
                        <div className={`flex items-center ${sidebarOpen ? ' gap-2' : 'justify-center'}`}>
                            {isPinned ? (
                                <div className='p-2 flex justify-center w-[25px] bg-primary/80 rounded-full text-white'>
                                    <Pin size={10} />
                                </div>
                            ) : (
                                <span className={`${sidebarOpen ? 'mx-2' : ''} min-h-6 flex items-center`}>
                                    <MessageSquare size={12} />
                                </span>
                            )}

                            {sidebarOpen && (
                                <span className='truncate min-w-[9rem] max-w-[9rem] text-nowrap p-1 text-left'>
                                    {chat.title || 'Chat sin título'}
                                </span>
                            )}
                        </div>
                    </Link>

                    {sidebarOpen && <ChatActionPopover chat={chat} />}
                </div>
            </li>
        );
    };

    // Componente para el mensaje de no hay chats
    const EmptyChatMessage = () => (
        <div className='text-[0.8rem] flex items-center gap-2 px-2'>
            <MessageSquareOff size={12} />
            {sidebarOpen && 'No hay chats recientes'}
        </div>
    );

    // Skeleton loader para los chats
    const SkeletonLoader = () => (
        <div className='space-y-2'>
            {Array(2)
                .fill(0)
                .map((_, index) => (
                    <div key={index} className='mb-1 w-full'>
                        <div className='flex items-center w-full'>
                            <Skeleton className='h-7 w-full rounded' />
                        </div>
                    </div>
                ))}
        </div>
    );

    // Function to render chat section with collapse/expand functionality
    const renderChatSection = (chatList: ApiChatSession[] = [], sectionTitle: string) => {
        // Validar la entrada
        if (!chatList || !Array.isArray(chatList) || chatList.length === 0) {
            console.log(`No chats to render for section: ${sectionTitle}`);
            return <EmptyChatMessage />;
        }

        console.log(`Rendering chat section "${sectionTitle}" with ${chatList.length} chats`);

        // Ordenar los chats (esto ya incluye validación)
        const sortedChats = sortChats(chatList);

        // Verificación adicional después del sorting
        if (!sortedChats || sortedChats.length === 0) {
            console.warn(`No valid chats after sorting for section: ${sectionTitle}`);
            return <EmptyChatMessage />;
        }

        // Determinar cuáles se muestran basados en expansión
        const isExpanded = expandedChats[sectionTitle];
        const maxVisibleChats = 4;
        const hasMoreChats = sortedChats.length > maxVisibleChats;
        const chatsToShow = isExpanded ? sortedChats.length : maxVisibleChats;

        // Limitar chats a mostrar
        const limitedChats = sortedChats.slice(0, chatsToShow);

        console.log(`Section "${sectionTitle}": showing ${limitedChats.length} of ${sortedChats.length} chats (expanded: ${isExpanded})`);

        // Registrar IDs para depuración
        if (process.env.NODE_ENV === 'development') {
            limitedChats.forEach((chat, idx) => {
                console.log(`  Chat #${idx} in section "${sectionTitle}": ID=${chat.chatId}, title=${chat.title || 'No title'}`);
            });
        }

        return (
            <div className='mb-4'>
                <ul className='space-y-1 transition-all duration-300 ease-in-out'>
                    {limitedChats.map((chat: ApiChatSession) => (
                        <ChatItem key={chat.chatId} chat={chat} />
                    ))}
                </ul>

                {hasMoreChats && <ShowMoreButton sectionTitle={sectionTitle} count={sortedChats.length - maxVisibleChats} />}
            </div>
        );
    };

    // Secciones de chats a renderizar
    const chatSections = [
        { title: 'Hoy', chatList: chats?.today },
        { title: 'Ayer', chatList: chats?.yesterday },
        { title: 'Último mes', chatList: chats?.lastMonth }
    ];

    // Componente para la cabecera de sección
    const SectionHeader = ({ title }: { title: string }) => (
        <div
            className='flex items-center cursor-pointer mb-2 hover:text-primary transition-colors duration-200'
            onClick={() => toggleExpandedSection(title)}
        >
            {sidebarOpen &&
                (expandedSection === title ? (
                    <ChevronDown size={16} className='mr-1 transition-transform duration-300' />
                ) : (
                    <ChevronRight size={16} className='mr-1 transition-transform duration-300' />
                ))}
            <p className='text-xs font-semibold'>{title}</p>
        </div>
    );

    return (
        <div
            className={`h-full bg-background border-r border-border transition-width duration-700 ${
                sidebarOpen ? 'w-70' : 'w-24 overflow-hidden'
            }`}
            style={{ position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}
        >
            <ScrollArea className='h-[calc(100vh-22.5rem)]'>
                <div className='grid grid-cols-1 px-4 overflow-hidden'>
                    {chatSections.map(({ title, chatList }) => (
                        <section
                            key={title}
                            className={`bg-container_menu rounded-lg px-4 py-2 my-2 transition-all duration-500 ease-in-out transform ${
                                expandedSection === title ? 'h-auto opacity-100 scale-100' : 'h-10 overflow-hidden opacity-75 scale-95'
                            }`}
                        >
                            <SectionHeader title={title} />

                            {expandedSection === title && (
                                <div className='transition-all duration-500 ease-in-out transform origin-top'>
                                    <ScrollArea className='h-auto rounded-md border'>
                                        {isLoading || error ? <SkeletonLoader /> : renderChatSection(chatList, title)}
                                    </ScrollArea>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
