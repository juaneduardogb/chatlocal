import { Info } from 'lucide-react';

export default function DisclaimerSection() {
    return (
        <section className='flex gap-4 items-center bg-warning p-2 px-4 select-none mt-2 text-xs'>
            <Info size={30} />
            <p>
                A continuación puedes añadir diversas configuraciones, pero es importante tener en cuenta que estas configuraciones{' '}
                <span className='font-bold'>se aplicarán de la misma manera a todos los documentos.</span>
            </p>
        </section>
    );
}
