import {
    BasicPerson,
    ContractType,
    DocumentStatus,
    KnowledgeBase,
    LineOfService,
    ProfilesAllowed,
    TagsElements,
    TypeOfWorkday
} from '@/types/documents';

export interface DocumentCreationForm {
    documentName: string;
    los: LineOfService[];
    labels: TagsElements[];
    support: BasicPerson[];
    statuses: DocumentStatus;
    profiles: ProfilesAllowed[];
    knowledgeBase: KnowledgeBase;
    sizeFormatted: string;
    size: number;
    documentUrl: string;
    documentUniqueName: string;
    content: string;
    tagsByAuthor: TagsElements[];
    subLoS: string;
    losOwner: string;
    typeOfWorkday: TypeOfWorkday[];
    contractType: ContractType[];
}

export interface DocumentResponse {
    knowledgeBase: KnowledgeBase;
    documents: Document[];
    totalDocuments: number;
    totalPublished: number;
    totalPending: number;
}

export interface DeleteDocumentResponse {
    success: boolean;
    message: string;
}

export interface DocumentUpdateForm {
    uniqueProcessID: string;
    documentName: string;
    summary: string;
    los: LineOfService[];
    profile: ProfilesAllowed[];
    losOwner: string;
    subLoS: string;
    supportPersons: BasicPerson[];
    labels: TagsElements[];
    tagsByAuthor: TagsElements[];
    typeOfWorkday: TypeOfWorkday[];
    contractType: ContractType[];
    modifiedBy: string;
}
