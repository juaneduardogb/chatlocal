import { Button } from '@/components/ui/button';
import { Document } from '@/types/documents';

interface ReferencesProps {
    references?: Document[];
}

export default function References({ references = [] }: ReferencesProps) {
    if (!references || references.length === 0) {
        return null;
    }

    return (
        <div className='flex flex-wrap gap-2 mt-3'>
            {references.map((ref, index) => (
                <Button
                    key={index}
                    variant='outline'
                    asChild
                    className='bg-white hover:bg-gray-50 rounded-full text-gray-900 border-gray-200 !text-[0.6rem]'
                >
                    <a
                        href={ref.documentUrl || ''}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center truncate'
                        title={ref.documentName}
                    >
                        <span className='mr-2 font-semibold bg-pink-600/10 px-1 rounded-md'>{index + 1}</span>
                        <span className='text-gray-600 max-w-[130px] truncate'>{ref.documentName}</span>
                    </a>
                </Button>
            ))}
        </div>
    );
}
