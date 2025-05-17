import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Label } from './label';

import { cn } from '@/utilities/utils';

const inputVariants = cva(
    'flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            error: {
                true: 'border-red-500 focus-visible:ring-red-500'
            }
        }
    }
);

// @ts-ignore
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, ...props }, ref) => {
    const id = React.useId();

    const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    };

    return (
        <div className='space-y-2'>
            {label && <Label htmlFor={id}>{label}</Label>}
            <input
                id={id}
                type={type}
                className={cn(inputVariants({ error: !!error }), className)}
                ref={ref}
                {...props}
                autoComplete='off'
                onKeyDown={handleKeyDown}
            />
            {error && (
                <p className='text-sm text-red-500 mt-1' id={`${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
});
Input.displayName = 'Input';

export { Input };
