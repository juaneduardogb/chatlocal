import { Check } from 'lucide-react';
import React from 'react';

interface CustomProgressProps {
    value: number;
}

const CustomProgress: React.FC<CustomProgressProps> = ({ value = 0 }) => {
    if (value > 100) {
        value = 100;
    }

    return (
        <div>
            <div className='w-full flex gap-3 items-center pt-1'>
                <div className='text-xs'>%0</div>
                <div className='h-2 relative w-full'>
                    <div className='overflow-hidden h-2 text-xs flex rounded bg-gray-200 w-full relative'>
                        <div
                            style={{ width: `${value}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-in-out items-center ${
                                value === 100 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                            }`}
                        ></div>
                    </div>
                    {value <= 99 && (
                        <div
                            className='absolute -bottom-6 transition-all duration-500 ease-in-out -px-[25px]'
                            style={{ left: `${value}%` }}
                        >
                            <span className='text-xs font-semibold inline-block text-gray-600'>{value.toFixed(0)}%</span>
                        </div>
                    )}
                </div>
                <div className='text-xs flex gap-2'>
                    {value === 100 && <Check size={15} className='bg-green-500 text-white rounded-full p-1' />}
                    %100
                </div>
            </div>
        </div>
    );
};

export default CustomProgress;
