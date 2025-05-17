interface StatusIndicatorProps {
    confirmation: boolean;
}

export default function StatusIndicator({ confirmation }: StatusIndicatorProps) {
    const isConfirmed = confirmation;
    return (
        <div className='text-center flex gap-2 items-center'>
            <div className={`h-2 w-2 rounded-full ${isConfirmed ? 'bg-green-500' : 'bg-status-warning-color'}`}></div>
            {isConfirmed ? 'Completado' : 'Pendiente'}
        </div>
    );
}
