export type TableIndicatorType = {
    title: string;
    total: number;
};

export type TagsElements = {
    label: string;
    id: string;
};

export enum ProfilesAllowed {
    'Socio',
    'Director',
    'Gerente',
    'Supervisor',
    'Especialista',
    'Analista',
    'Asistente',
    'Practicante'
}
export enum LineOfService {
    'xLoS',
    'Assurance',
    'Tax',
    'Advisory',
    'IFS'
}

export enum TypeOfWorkday {
    'Tiempo completo',
    'Tiempo parcial'
}
export enum ContractType {
    'Indefinido',
    'Plazo fijo'
}

export type DocumentStatus = {
    labels: {
        confirmation: boolean;
        date: string | null;
        person: string | null;
    };
    access: {
        confirmation: boolean;
        date: string | null;
        person: string | null;
    };
    owners: {
        confirmation: boolean;
        date: string | null;
        person: string | null;
    };
    support: {
        confirmation: boolean;
        date: string | null;
        person: string | null;
    };
    publish: {
        confirmation: boolean;
        date: string | null;
        person: string | null;
    };
};

export type BasicPerson = {
    name: string;
    email: string;
    employeeId: number;
};

interface IKnowledgeBase {
    knowledgeId: string;
    name: string;
    description: string;
    author: number; // guid
    createdAt: Date;
    lastUpdate: Date;
}

export interface MetaDataExtracted {
    [key: string]: string | Array<unknown>;
}

export type Document = {
    id: string;
    documentName: string;
    uniqueProcessID: string;
    los: LineOfService[];
    subLoS: string;
    losOwner: string;
    labels: TagsElements[] | null; // etiquetas que solicita extraer el usuario
    tagsByAuthor: TagsElements[] | null; // etiquetas customizadas por el usuario
    owners: BasicPerson[];
    support: BasicPerson[];
    statuses: DocumentStatus;
    isPublished: boolean;
    profiles: ProfilesAllowed[];
    knowledgeBase: IKnowledgeBase;
    typeOfWorkday: TypeOfWorkday[];
    contractType: ContractType[];
    sizeFormatted: string;
    size: number;
    createdAt: Date;
    metaData?: MetaDataExtracted[];
    summary?: string;
    documentUrl: string;
    documentUniqueName: string;
    content: string;
};

export interface KnowledgeBase {
    knowledgeId?: string;
    name: string;
    description: string;
    author: string;
    totalDocuments: number;
    los: LineOfService[];
    profiles: ProfilesAllowed[];
    losOwner: string;
    subLoS: string;
    owners: BasicPerson[];
    support: BasicPerson[];
    typeOfWorkday: TypeOfWorkday[];
    contractType: ContractType[];
    createdAt: string;
    lastUpdate: string;
}

export interface ExtractTextFromDocumentResponse {
    documentContent: string | null;
    documentUrl: string | null;
    documentUniqueName: string | null;
    sizeFormatted: string;
    size: number;
    documentName: string;
}
export interface DocumentsByUserResponse {
    documents: Document[];
    totalDocuments: number;
    totalPublished: number;
    totalPending: number;
}

export interface FormFields {
    documentName: string;
    summary: string;
    los: string[];
    profile: string[];
    losOwner: string;
    subLoS: string;
    ownerPersons: {
        label: string;
        value: string;
    }[];
    supportPersons: {
        label: string;
        value: string;
    }[];
}

export interface KnowledgeMassiveConfiguration {
    knowledgeId: string;
    los: LineOfService[];
    profiles: ProfilesAllowed[];
    losOwner: string;
    subLoS: string;
    support: BasicPerson[];
    modifiedBy: string;
    typeOfWorkday: TypeOfWorkday[];
    contractType: ContractType[];
    allDocumentsIds: string[];
}
