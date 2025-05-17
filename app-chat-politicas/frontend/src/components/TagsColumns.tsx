import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

import { Badge } from './ui/badge';

interface TagsColumns {
    allLabels: Array<string>;
    bgColor?: string;
}

export default function TagsColumns({ allLabels, bgColor }: TagsColumns) {
    return (
        <div className='flex flex-wrap items-center w-48'>
            {allLabels.length > 0 ? (
                <>
                    <div className='flex flex-wrap gap-1'>
                        {allLabels.slice(0, 2).map((tag, index) => (
                            <Badge
                                key={index}
                                variant='outline'
                                className={`text-foreground text-[12px] py-1 px-2 rounded-full transition-colors hover:bg-secondary-hover ${bgColor}`}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    {allLabels.length > 3 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className='bg-container_menu text-foreground text-[10px] border m-1 w-fit h-fit p-1 border-black/10 rounded-xl cursor-pointer hover:bg-primary hover:text-primary-foreground transition-color'>
                                    +{allLabels.length - 2} más
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className='max-w-90 w-fit p-2 h-fit'>
                                <div className='space-y-3'>
                                    <h3 className='font-medium text-sm'>Información</h3>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {allLabels.map((tag, index) => (
                                            <Badge key={index} variant='outline' className='text-[12px] py-1 px-2 rounded-full w-auto'>
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </>
            ) : (
                <span className='text-muted-foreground text-xs'>Sin Información</span>
            )}
        </div>
    );
}
