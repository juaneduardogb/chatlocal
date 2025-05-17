import { Button } from '@heroui/button';
import { Modal, message } from 'antd';
import { ArrowDown } from 'lucide-react';
import { memo, useState, useRef, useCallback, useEffect } from 'react';

import { ScrollArea } from './ui/scroll-area';

import { useAcceptTerms } from '@/hooks/app/useAcceptTerms';
import { useAppStore } from '@/store/app';

function Disclaimer() {
    const { userEmail } = useAppStore();

    const [modalOpen, setModalOpen] = useState(true);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollAreaRef = useRef(null);
    const [fadeIn, setFadeIn] = useState(false);

    // Usando el hook de mutación para aceptar términos
    const acceptTermsMutation = useAcceptTerms();

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        // Check if user has scrolled to the bottom (with a small threshold)
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

        if (isAtBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    const handleAcceptTerms = useCallback(async () => {
        try {
            // Ejecutar la mutación para aceptar términos
            await acceptTermsMutation.mutateAsync({
                accepted: true
            });

            // Mostrar mensaje de éxito después de un pequeño retraso
            setTimeout(() => {
                message.success('Términos y condiciones aceptados correctamente');
            }, 500);
        } catch (error) {
            console.error('Error al aceptar términos y condiciones:', error);
            message.error('Ocurrió un error al aceptar los términos y condiciones. Por favor, intenta nuevamente.');
        }
    }, [acceptTermsMutation]);

    const modalClass = `transition-all duration-500 ease-in-out transform ${fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;

    return (
        <Modal
            title={
                <div className='flex items-center'>
                    <span className='text-lg font-bold'>Aceptación uso del Chat PwC Chile</span>
                </div>
            }
            open={modalOpen}
            centered
            maskClosable={false}
            closable={false}
            footer={
                <div className={`transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                    <section className='flex w-full justify-end gap-x-4'>
                        {hasScrolledToBottom ? (
                            <Button
                                color='primary'
                                onPress={handleAcceptTerms}
                                isDisabled={acceptTermsMutation.isPending}
                                className='transition-all duration-300 hover:scale-105'
                            >
                                {acceptTermsMutation.isPending ? (
                                    <div className='flex items-center'>
                                        <svg
                                            className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        Procesando...
                                    </div>
                                ) : (
                                    'Acepto los términos y condiciones'
                                )}
                            </Button>
                        ) : (
                            <p className='text-sm text-primary italic animate-pulse flex gap-2 mt-2 font-bold'>
                                <ArrowDown className='animate-bounce' />
                                Desplácese hasta el final para aceptar los términos y condiciones
                            </p>
                        )}
                    </section>
                </div>
            }
            className={`md:min-w-[50vw] ${modalClass}`}
            modalRender={modal => <div className={modalClass}>{modal}</div>}
        >
            <ScrollArea className='!max-h-[75vh] overflow-y-scroll px-3' onScroll={handleScroll} ref={scrollAreaRef}>
                <div className={`grid gap-y-4 text-xs transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                    <h2>Disclaimer – Términos de uso Chat PwC Chile</h2>
                    <p>
                        Estos términos rigen el uso de la herramienta digital denominada Chat PwC Chile y todas sus actualizaciones y
                        versiones posteriores. El uso de esta herramienta implica la aceptación por parte de los trabajadores de PwC Chile,
                        en adelante individualmente el "Usuario" o los "Usuarios", de las siguientes términos y condiciones:
                    </p>
                    <p>
                        <span className='font-bold'>a.</span> Objetivo de la Herramienta Digital. Chat PwC Chile es una herramienta digital
                        diseñada para brindar asistencia y soporte para responder consultas de los trabajadores de PwC Chile en relación con
                        las políticas y beneficios de PwC Chile. Esta herramienta no está diseñada y no puede ser usada para dar respuesta a
                        trabajos ni solicitudes realizadas por clientes o proveedores, prestar servicios a clientes, o con otros fines que
                        digan relación con clientes o con proveedores de PwC Chile.
                    </p>
                    <p>
                        <span className='font-bold'>b.</span> Límite de consultas. Los Usuarios tendrán un límite de consultas diarias. No
                        pudiendo hacer más de 30 consultas al día.
                    </p>
                    <p>
                        <span className='font-bold'>c.</span> Seguridad de la Información. Chat PwC Chile está diseñada para responder a las
                        consultas que realicen los Usuarios en un ambiente seguro que cumple con las políticas y estándares de la Red de
                        Firmas PwC.
                    </p>
                    <p>
                        <span className='font-bold'>d.</span> Uso de Información Confidencial. Sin perjuicio del ambiente seguro en el que
                        se realizan las consultas, está estrictamente prohibido utilizar el Chat PwC Chile para compartir, almacenar o
                        transmitir información confidencial o sensible. Esto incluye, pero no se limita a información personal, financiera,
                        médica, de clientes, proveedores, o cualquier otra información que pueda comprometer la privacidad de sus titulares,
                        la seguridad y/o confidencialidad de nuestros clientes y/o proveedores.
                    </p>
                    <p>
                        <span className='font-bold'>e.</span> Tratamiento de Datos. Al acceder y utilizar la herramienta, el Usuario otorga
                        su consentimiento para que el tratamiento de la información se realice conforme las políticas de privacidad de PwC
                        Chile y la regulación vigente, esto es la Ley N° 19.628 sobre Protección de la Vida Privada. Adicionalmente, el Chat
                        PwC Chile recopilará, usará, almacenará y procesará direcciones de correo electrónico, cargo y área del Usuario, con
                        el fin de autenticar al Usuario. Esta información podría ser considerada como datos personales por lo que su
                        tratamiento se ajusta a lo dispuesto en la regulación vigente y quedará alojada en servidores internos. PwC Chile
                        tomará todas las medidas de seguridad de la información y confidencialidad para proteger dichos datos. En este
                        sentido, los datos no serán retenidos y agregados a la base de conocimiento de la herramienta lo que garantiza que
                        no se integren datos de PwC, ni cualquier otro dato que hubiere sido compartido por el Usuario a través de la
                        herramienta. Adicionalmente, PwC Chile recopilará, usará, almacenará y procesará direcciones de correo electrónico,
                        cargo y área del Usuario, historial del Chat de Beneficios, conexión, hora de conexión y uso para fines estadísticos
                        y de análisis. La información quedará alojada en servidores internos de forma anonimizada impidiendo la
                        identificación del Usuario.
                    </p>
                    <p>
                        <span className='font-bold'>f.</span> Exactitud y fuente de la información. La información proporcionada por medio
                        de Chat PwC Chile se basa en las políticas y la información que mantiene PwC Chile a disposición de sus trabajadores
                        en la intranet. Sin perjuicio de lo anterior, la información proporcionada por el Chat PwC Chile puede contener
                        errores, ser incompleta o inexacta. PwC Chile no se hace responsable por los errores u omisiones que la información
                        proporcionada pueda tener, ni tampoco por las consecuencias que dichos errores, omisiones o inexactitudes pudieran
                        originar. El contenido generado por el Chat PwC Chile debe ser confirmado con Capital Humano antes de tomar
                        decisiones que se basen en dicha información. PwC Chile no se hace responsable por las decisiones que los Usuarios
                        tomen basados en la información proporcionada por el Chat PwC Chile. El Chat PwC Chile podría entregar respuestas
                        que podrían ser consideradas ofensivas o que vayan en contra de nuestras políticas internas atendido que se trata de
                        una herramienta que funciona en base a Inteligencia Artificial. PwC Chile no se hace responsable por este tipo de
                        afirmaciones. Quienes reciban una respuesta de estas características por parte de la herramienta, deberá ponerlo en
                        conocimiento de <span className='font-bold'>cl_automatizacion_y_plataforma@pwc.com</span> a la brevedad posible,
                        para que PwC Chile tome las medidas pertinentes, toda vez que tales comentarios van en contra de las políticas de la
                        Firma.
                    </p>
                    <p>
                        <span className='font-bold'>g.</span> Responsabilidad del Usuario y Prohibiciones. El Usuario es responsable de
                        todas las acciones realizadas a través de su cuenta y se compromete a usar el Chat PwC Chile responsablemente, de
                        buena fe y siempre siguiendo las directrices de ética y probidad establecidas en el Código de Conducta de PwC Chile,
                        así como en el Reglamento Interno de Orden, Higiene y Seguridad y cualquier otra política que sea complementaria de
                        estos. Está estrictamente prohibido realizar consultas que puedan ser consideradas inapropiadas, violentas,
                        ofensivas, o que vayan en contra de las políticas internas de PwC Chile, especialmente de lo dispuesto en el Código
                        de Conducta. Cualquier uso indebido del Chat PwC Chile que infrinja lo dispuesto en estos términos, y/o que
                        comprometa la seguridad de la información, y/o que vulnere las políticas internas de PwC Chile sobre seguridad de la
                        información, confidencialidad, probidad y ética será de exclusiva responsabilidad del Usuario y podrá dar lugar a
                        sanciones disciplinarias de acuerdo con lo dispuesto en el Reglamento Interno de Orden, Higiene y Seguridad.
                    </p>
                    <p>
                        <span className='font-bold'>h.</span> Modificaciones de los Términos. PwC se reserva el derecho de modificar estos
                        términos y condiciones en cualquier momento. Las modificaciones serán aplicables inmediatamente después de su
                        publicación en el Chat PwC Chile. El uso continuado del Chat PwC Chile constituye aceptación de los nuevos términos.
                    </p>
                    <p>
                        <span className='font-bold'>i.</span> Limitación de Responsabilidad. PwC Chile no será responsable por ningún daño
                        directo o indirecto que resulte del uso o la imposibilidad de uso del Chat PwC Chile. A su vez, PwC Chile no
                        garantiza que la herramienta funcionará ininterrumpidamente ni que dará respuesta a todas las consultas realizadas
                        por los Usuarios.
                    </p>
                    <p>
                        <span className='font-bold'>j.</span> Ley Aplicable. Estos términos y condiciones se regirán e interpretarán de
                        acuerdo a la regulación chilena.
                    </p>
                    <p>
                        <span className='font-bold'>k.</span> Contacto. En caso de dudas en cuanto al tratamiento y el uso de los datos
                        proporcionados por medio de la herramienta, o sobre cualquier aspecto relacionado con estos términos y condiciones
                        por favor contactarse con <span className='font-bold'>cl_automatizacion_y_plataforma@pwc.com</span>. También puede
                        revisar nuestras políticas de privacidad disponibles en
                        <a
                            href='https://www.pwc.com/cl/es/privacidad.html'
                            className='href hover:text-black hover:font-bold px-2 hover:p-0'
                            target='_blank'
                            rel='noopener'
                        >
                            https://www.pwc.com/cl/es/privacidad.html
                        </a>
                        y, en caso que requieras hacer uso de los derechos que la ley te otorga como titular de datos personales, te
                        invitamos a que te dirijas a la siguiente casilla de correo:{' '}
                        <span className='font-bold'>cl_datospersonales@pwc.com</span>
                    </p>
                </div>
            </ScrollArea>
        </Modal>
    );
}

export default memo(Disclaimer);
