import { TagsElements } from '@/types/documents';

interface ILabelsTag {
    tag: TagsElements;
    customRemove?: JSX.Element;
}
export default function LabelsTag({ tag, customRemove }: ILabelsTag) {
    return (
        <div className='bg-warning px-4 rounded-full w-fit flex items-center gap-2 select-none' id={tag.id} key={tag.id}>
            {tag.label} {customRemove}
        </div>
    );
}
