import { Avatar } from '@heroui/avatar';
import { UIMessage } from 'ai';

interface ChatMessageProps {
    message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {isAssistant && (
                <div className='flex-shrink-0'>
                    <Avatar src='/assistant-avatar.png' fallback='AI' className='w-8 h-8 bg-blue-500 text-white' />
                </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2 rounded-lg ${
                        isUser ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                >
                    {message.content}
                </div>

                {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className='mt-2 space-y-2'>
                        {message.toolInvocations.map(tool => (
                            <div key={tool.toolCallId} className='bg-gray-50 border border-gray-200 rounded-md p-3 text-sm'>
                                <div className='font-medium text-gray-700'>{tool.toolName}</div>
                                <pre className='mt-1 text-xs text-gray-600 overflow-x-auto'>{JSON.stringify(tool.args, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                )}

                <div className='text-xs text-gray-500 mt-1'>{message.createdAt && new Date(message.createdAt).toLocaleTimeString()}</div>
            </div>

            {isUser && (
                <div className='flex-shrink-0'>
                    <Avatar src='/user-avatar.png' fallback='You' className='w-8 h-8 bg-blue-700 text-white' />
                </div>
            )}
        </div>
    );
}
