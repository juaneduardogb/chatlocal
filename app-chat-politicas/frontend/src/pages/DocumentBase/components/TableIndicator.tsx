import SkeletonButton from 'antd/es/skeleton/Button';
import { memo } from 'react';

import type { TableIndicatorType } from '@/types/documents';

interface ITableIndicator {
    indicators: TableIndicatorType[];
    isLoading: boolean;
}
function TableIndicator({ indicators, isLoading }: ITableIndicator) {
    return (
        <section className='flex gap-8 text-xs items-center my-2 xs:justify-center xs:w-full'>
            {indicators.map((indicator, index) => (
                <div
                    className='md:flex gap-2 md:items-center xs:min-h-[5rem] xs:grid text-center xs:grid-rows-2 justify-self-center justify-center'
                    key={index}
                >
                    <div className='h-5 flex justify-items-center '>{indicator.title}</div>
                    {isLoading ? (
                        <SkeletonButton className='max-w-[3.1rem] min-w-[3.1rem]' size='small' active></SkeletonButton>
                    ) : (
                        <div className='xs:self-end p-2 min-w-[50px] text-center border font-bold rounded-md select-none bg-container_menu'>
                            {indicator.total}
                        </div>
                    )}
                </div>
            ))}
        </section>
    );
}

export default memo(TableIndicator);
