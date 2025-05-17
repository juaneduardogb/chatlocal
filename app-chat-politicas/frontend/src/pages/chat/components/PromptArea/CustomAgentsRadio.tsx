import { VisuallyHidden, cn, useRadio } from '@heroui/react';
import { Check } from 'lucide-react';
import React from 'react';

interface CustomAgentsRadioProps {
    value: string;
    isDisabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    // Otras props que puedan ser pasadas al hook useRadio
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
}

export const CustomAgentsRadio = (props: CustomAgentsRadioProps) => {
    const { Component, children, getBaseProps, getInputProps, getLabelProps, getLabelWrapperProps, isDisabled, isSelected } =
        useRadio(props);

    return (
        <Component
            {...getBaseProps()}
            className={cn(
                'group inline-flex items-center hover:bg-primary/20 active:opacity-50 justify-between flex-row-reverse tap-highlight-transparent',
                'max-w-[300px] cursor-pointer border-2 border-default rounded-lg gap-4 px-2 py-2',
                'data-[selected=true]:border-primary data-[selected=true]:bg-primary/20',
                isDisabled ? 'opacity-50' : ''
            )}
        >
            <VisuallyHidden>
                <input {...getInputProps()} style={{ display: 'none' }} />
            </VisuallyHidden>
            <span>{isSelected && <Check size={15} />}</span>
            <div {...getLabelWrapperProps()}>
                {children && (
                    <span {...getLabelProps()} className='text-xs flex items-center gap-2'>
                        {children}
                    </span>
                )}
            </div>
        </Component>
    );
};
