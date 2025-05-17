import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@/store/app';
import { backendEndpoints } from '@/constants/backend-routes';

interface ChatSession {
    chatId: string;
    userEmail: string;
    title: string | null;
    messages: unknown[];
    createdAt: string;
    updatedAt: string;
}

interface CategorizedChats {
    today: ChatSession[];
    yesterday: ChatSession[];
    lastWeek: ChatSession[];
    lastMonth: ChatSession[];
    older: ChatSession[];
}

export function useUserChats() {
    const { userEmail, token } = useAppStore();

    return useQuery<CategorizedChats>({
        queryKey: ['userChats', userEmail],
        queryFn: async () => {
            if (!userEmail) {
                return {
                    today: [],
                    yesterday: [],
                    lastWeek: [],
                    lastMonth: [],
                    older: []
                };
            }

            const response = await fetch(`${backendEndpoints.BASE_CHAT_ENDPOINTS}/user-chats`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user chats');
            }

            return await response.json();
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        enabled: !!userEmail, // Only run the query if userName exists
        staleTime: 1000 * 60 * 5 // Data is fresh for 5 minutes
    });
}
