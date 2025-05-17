export const logo = new URL('/chatia/assets/logo_pwc.png', import.meta.url).href;
export const logoWhite = new URL('/chatia/assets/logo_pwc_white.png', import.meta.url).href;

export const allLineOfServiceOptions = ['xLoS', 'Assurance', 'Tax', 'IFS', 'Advisory'];

export const allProfilesOptions = [
    'Socio',
    'Director',
    'Senior Manager',
    'Gerente',
    'Supervisor',
    'Coordinador',
    'Especialista',
    'Analista',
    'Asistente',
    'Practicante'
];

export const allContractTypes = ['Indefinido', 'Plazo fijo'];
export const allTypeOfWorkday = ['Tiempo completo', 'Tiempo parcial'];

export enum ELineOfService {
    IFS,
    Advisory,
    Assurance,
    Tax
}

export const lineOfServiceInformation: { [key: string]: { [key: string]: string } } = {
    IFS: {
        'CL-IFS-Santiago-GTS - Soporte Tecnico': 'GTS',
        'CL-IFS-SANTIAGO-Administracion': 'Administración',
        'CL-IFS-Santiago-Finanzas': 'Finanzas',
        'CL-IFS-SANTIAGO-Adm - Recursos Humanos': 'Capital Humano',
        'CL-IFS-SANTIAGO-Publicidad y Marketing': 'Marketing y Comunicaciones',
        'CL-IFS-SANTIAGO-Learning & Administracion': 'Learning & Administracion'
    },
    Advisory: {
        'CL-ADV-SANTIAGO-Tecnology': 'Tecnology',
        'CL-ADV-Santiago-Perfomance and Process Improvement': 'Strategy & Operations',
        'CL-ADV-SANTIAGO-Transaction Services Deals': 'Transaction Services',
        'CL-ADV-SANTIAGO-EMPRESA PWC STRATEGY': 'Strategy &',
        'CL-ADV-Santiago-GRC Consulting': 'Governance Risk & Compliance',
        'CL-ADV-Santiago-Sustainable Business Solutions CAMBIO CLIMATICO': 'Sustainability & Climate Change',
        'CL-ADV-SANTIAGO-Financial Service/Risk Management (CPI)': 'Capital Project & Infraestructure (CPI)',
        'CL-ADV-SANTIAGO-HRS - Recursos Humanos': 'People & Organization (HRS)',
        'CL-ADV-SANTIAGO-Forensics Services (FS)': 'Forensic Services',
        'CL-ADV-Santiago-Real Estate': 'Real Estate',
        'CL-ADV-Santiago-Digital': 'Digital'
    },
    Assurance: {
        'CL-ASS-Santiago-Assurance': 'Auditoría',
        'CL-ASS-Santiago-Risk & Regulatory Services (RRS)': 'Risk & Regulatory Services (RRS)',
        'CL-ASS-SANTIAGO-Systems and Process Assurance': 'Systems and Process Assurance'
    },
    Tax: {
        'CL-TAX-Santiago-Tax Compliance': 'Compliance',
        'CL-TAX-SANTIAGO-TAX Consultoria': 'Consulting',
        'CL-TAX-SANTIAGO-Outsourcing - TRS': 'TRS',
        'CL-TAX-SANTIAGO-TAXT - SERVICIOS LABORALES': 'Servicios Laborales',
        'CL-TAX-SANTIAGO-TAXP Precios de Transferencia': 'Precios de Transferencia',
        'CL-TAX-SANTIAGO-TAXL Litigios': 'Litigios',
        'CL-TAX-PUERTO MONTT-TAX Consultoria': 'Consulting PM'
    }
};
