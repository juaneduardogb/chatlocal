import { Divider, Popover, PopoverContent, PopoverTrigger, RadioGroup } from '@heroui/react';
import { Bot, CircleDollarSign, HandCoins } from 'lucide-react';
import React from 'react';

import { CustomAgentsRadio } from '@/pages/chat/components/PromptArea/CustomAgentsRadio';
import { useAppStore } from '@/store/app';

// Define agent data with colors
const agents = [
    {
        id: 'invoicing-collection-toolkit',
        name: 'Cobranza',
        color: '#FF5733', // Red-orange color
        icon: HandCoins,
        disabled: true
    },
    {
        id: 'invoice-toolkit',
        name: 'Facturación',
        color: '#33A1FF', // Blue color
        icon: CircleDollarSign,
        disabled: true
    },
    {
        id: 'internal-documents-toolkit',
        name: 'Políticas/Beneficio',
        color: '#299D8F', // Green color
        icon: null,
        disabled: false
    }
];

export default function AgentPopover() {
    const { selectedAgent, setSelectedAgent } = useAppStore();

    const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const agentId = e.target.value;
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            setSelectedAgent({
                id: agent.id,
                name: agent.name,
                color: agent.color
            });
        } else {
            setSelectedAgent(null);
        }
    };

    return (
        <Popover placement='top' containerPadding={8}>
            <PopoverTrigger disabled={true} className='hidden'>
                <div
                    className='p-2 cursor-pointer rounded-full hover:bg-black/10'
                    style={{
                        color: selectedAgent?.color || 'inherit'
                    }}
                >
                    <Bot />
                </div>
            </PopoverTrigger>
            <PopoverContent className='bg-container_menu text-foreground px-2 py-2 min-w-[200px]'>
                <RadioGroup isRequired={false} className='min-w-[200px]' value={selectedAgent?.id || ''} onChange={handleAgentChange}>
                    <p className='px-2 font-medium select-none text-xs'>Agentes</p>
                    {agents.map(agent => (
                        <CustomAgentsRadio
                            key={agent.id}
                            value={agent.id}
                            isDisabled={agent.disabled}
                            className={agent.disabled ? '!opacity-45' : ''}
                        >
                            {agent.icon && <agent.icon size={18} />} {agent.name}
                        </CustomAgentsRadio>
                    ))}
                    <Divider />
                </RadioGroup>
            </PopoverContent>
        </Popover>
    );
}
