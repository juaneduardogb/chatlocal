import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThinkingEvent } from '@/types/message';

interface ThinkingTimelineProps {
    events: ThinkingEvent[];
    isThinking: boolean;
    maxHeight?: string;
    completed?: boolean;
}

export const ThinkingTimeline = ({ events = [], isThinking = false, maxHeight = '300px', completed = false }: ThinkingTimelineProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [dots, setDots] = useState('');
    const [visibleEvents, setVisibleEvents] = useState<ThinkingEvent[]>([]);

    // Efecto para mostrar eventos gradualmente
    useEffect(() => {
        if (isThinking) {
            setVisibleEvents([]);
            let currentIndex = 0;
            const interval = setInterval(() => {
                if (currentIndex < events.length) {
                    setVisibleEvents(prev => [...prev, events[currentIndex]]);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        } else {
            // Si ya no está pensando, mostrar todos los eventos inmediatamente
            if (completed) {
                setVisibleEvents([...events]);
            }
        }
        return undefined;
    }, [isThinking, events, completed]);

    // Efecto para la animación de puntos suspensivos
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isThinking) {
            interval = setInterval(() => {
                setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
            }, 500);
        } else {
            // Detener la animación de puntos cuando no está pensando
            setDots('');
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isThinking]);

    // Formatear la hora para mostrarla en el timeline
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // Efecto para cerrar el timeline después de completar
    useEffect(() => {
        if (completed && !isThinking) {
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [completed, isThinking]);

    // Efecto por si no hay eventos visibles pero hay eventos y está completado, mostrar todos los eventos
    useEffect(() => {
        if (completed && events.length > 0 && visibleEvents.length === 0) {
            setVisibleEvents([...events]);
        }
    }, [completed, events, visibleEvents.length]);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className='w-full border rounded-lg bg-gradient-to-r from-foreground/5 to-background shadow-sm mb-4'
        >
            <CollapsibleTrigger className='flex items-center justify-between w-full p-4 text-sm font-medium'>
                <div className='flex items-center gap-2'>
                    <Brain className='h-4 w-4 text-foreground' />
                    <span className='text-foreground'>
                        {isThinking ? `Esperando respuesta${dots}` : completed ? 'Respuesta obtenida' : 'Respuesta detenida'}
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    {isThinking && <Loader2 className='h-4 w-4 text-foreground animate-spin' />}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.5 }}>
                        <ChevronDown className='h-4 w-4 text-foreground/70' />
                    </motion.div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='overflow-hidden'
                >
                    <div className='px-4 pb-4'>
                        <ScrollArea className={`w-full max-h-[${maxHeight + 30}]`}>
                            <div className='space-y-4'>
                                {events.length === 0 ? (
                                    <p className='text-sm text-black/70 py-2'>No events yet</p>
                                ) : (
                                    <div className='relative ml-6 pt-2'>
                                        {/* Eventos del timeline con animación */}
                                        <AnimatePresence>
                                            <motion.div
                                                className='absolute left-0 top-0 w-0.5 bg-gradient-to-b from-foreground to-foreground/30 -ml-3'
                                                initial={{ height: 0 }}
                                                animate={{
                                                    height: '100%'
                                                }}
                                                transition={{
                                                    duration: isThinking ? visibleEvents.length * 0.5 : 0.5,
                                                    ease: 'easeOut',
                                                    delay: 0.4
                                                }}
                                            />
                                            {visibleEvents.map((event, index) => {
                                                return (
                                                    <div key={event.id}>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            transition={{
                                                                duration: 0.3,
                                                                delay: isThinking ? index * 0.5 : 0
                                                            }}
                                                            className='relative mb-4 last:mb-0'
                                                        >
                                                            {/* Círculo indicador con degradado */}
                                                            <motion.div
                                                                className='absolute left-0 w-2 h-2 rounded-full bg-gradient-to-br from-foreground to-foreground/70 -ml-[0.93rem] mt-1.5'
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                    delay: isThinking ? index * 0.1 : 0
                                                                }}
                                                            />

                                                            <div className='pl-4'>
                                                                <div className='flex items-center gap-2'>
                                                                    <span className='text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-foreground/20 to-foreground/10 text-foreground'>
                                                                        {event.type}
                                                                    </span>
                                                                    <p className='text-sm mt-1'>{event.message}</p>
                                                                </div>
                                                                <span className='text-[0.6rem] font-mono text-foreground/70'>
                                                                    {formatTime(event.timestamp)}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </motion.div>
            </CollapsibleContent>
        </Collapsible>
    );
};
