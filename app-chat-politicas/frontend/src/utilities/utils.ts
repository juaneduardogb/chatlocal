import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { GenericLabel } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (date: string) => {
    const dateConverted = new Date(date);
    const formattedDate = dateConverted.toLocaleString();
    return formattedDate;
};

export function convertSize(sizeBytes: number) {
    if (sizeBytes === 0) {
        return '0B';
    }
    const sizeNames = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(sizeBytes) / Math.log(1024));
    const p = Math.pow(1024, i);
    const s = Math.round((sizeBytes / p) * 100) / 100;
    return `${s} ${sizeNames[i]}`;
}

export const parsePersons = (persons: GenericLabel[]) =>
    persons.map(person => JSON.parse(typeof person === 'string' ? person : person.value));
