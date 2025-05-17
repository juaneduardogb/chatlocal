import { Image } from '@heroui/react';
import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
    const components: Partial<Components> = {
        // @ts-expect-error
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                // @ts-expect-error
                <pre
                    {...props}
                    className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-background p-3 rounded-lg mt-2 dark:bg-zinc-800`}
                >
                    <code className={match[1]}>{children}</code>
                </pre>
            ) : (
                <code className={`${className} text-sm bg-background dark:bg-zinc-800 py-0.5 px-1 rounded-md`} {...props}>
                    {children}
                </code>
            );
        },
        ol: ({ node, children, ...props }) => {
            return (
                <ol className='list-decimal list-outside ml-4' {...props}>
                    {children}
                </ol>
            );
        },
        li: ({ node, children, ...props }) => {
            return (
                <li className='py-1' {...props}>
                    {children}
                </li>
            );
        },
        ul: ({ node, children, ...props }) => {
            return (
                <ul className='list-decimal list-outside ml-4' {...props}>
                    {children}
                </ul>
            );
        },
        strong: ({ node, children, ...props }) => {
            return (
                <span className='font-semibold' {...props}>
                    {children}
                </span>
            );
        },
        a: ({ node, children, ...props }) => {
            return (
                <a className='text-ai_response_link_color hover:underline font-bold' target='_blank' rel='noreferrer' {...props}>
                    {children}
                </a>
            );
        },
        h1: ({ node, children, ...props }) => {
            return (
                <h1 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h1>
            );
        },
        h2: ({ node, children, ...props }) => {
            return (
                <h2 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h2>
            );
        },
        h3: ({ node, children, ...props }) => {
            return (
                <h3 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h3>
            );
        },
        h4: ({ node, children, ...props }) => {
            return (
                <h4 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h4>
            );
        },
        h5: ({ node, children, ...props }) => {
            return (
                <h5 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h5>
            );
        },
        h6: ({ node, children, ...props }) => {
            return (
                <h6 className='text-xs font-semibold mt-6 mb-3' {...props}>
                    {children}
                </h6>
            );
        },
        table: ({ node, children, ...props }) => {
            return (
                <div className='w-full my-3 overflow-hidden rounded-lg' style={{ border: '1px solid #e3e3e3' }}>
                    <table className='w-full border-collapse' {...props}>
                        {children}
                    </table>
                </div>
            );
        },
        tr: ({ node, children, ...props }) => {
            return (
                <tr {...props} style={{ borderBottom: '1px solid #e3e3e3' }}>
                    {children}
                </tr>
            );
        },
        td: ({ node, children, ...props }) => {
            return (
                <td {...props} className='p-2' style={{ borderRight: '1px solid #e3e3e3' }}>
                    {children}
                </td>
            );
        },
        th: ({ node, children, ...props }) => {
            return (
                <th {...props} className='p-2 font-semibold' style={{ borderRight: '1px solid #e3e3e3' }}>
                    {children}
                </th>
            );
        },
        thead: ({ node, children, ...props }) => {
            return (
                <thead className='bg-[#0000001a]' {...props}>
                    {children}
                </thead>
            );
        },
        tbody: ({ node, children, ...props }) => {
            return <tbody {...props}>{children}</tbody>;
        },
        img: ({ node, children, ...props }) => {
            return (
                <div className='my-4'>
                    {/* @ts-ignore */}
                    <Image isBlurred alt='Imagen externa' className='bg-auto' shadow='sm' radius='lg' height={200} {...props} />
                </div>
            );
        }
    };

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} className='text-xs'>
            {children}
        </ReactMarkdown>
    );
};

export const Markdown = memo(NonMemoizedMarkdown, (prevProps, nextProps) => prevProps.children === nextProps.children);
