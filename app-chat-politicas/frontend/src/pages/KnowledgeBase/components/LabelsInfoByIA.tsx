import { MetaDataExtracted } from '@/types/documents';

interface LabelsInfoByIAProps {
    metaData: MetaDataExtracted[];
}
export default function LabelsInfoByIA({ metaData }: LabelsInfoByIAProps) {
    return (
        <ul className='grid gap-y-6 text-xs'>
            {metaData.map((label, index) => (
                <li key={index} className='flex items-center flex-wrap gap-y-3 '>
                    <span className='font-bold lower bg-pink-600/10 p-2 mr-3 select-none'>{Object.keys(label)}: </span>
                    {Object.keys(label).map(key => (
                        <span className=''>{typeof label[key] === 'string' ? label[key] : label[key].join(', ')}</span>
                    ))}
                </li>
            ))}
        </ul>
    );
}
