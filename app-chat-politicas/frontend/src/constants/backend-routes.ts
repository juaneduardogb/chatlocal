export const backendEndpoints = {
    CREATE_KNOWLEDGE_BASE: '/knowledge-base/create-knowledge-base',
    DELETE_KNOWLEDGE_BASE: '/knowledge-base/',
    MASSIVE_KNOWLEDGE_CONFG: '/knowledge-base/massive-knowledge-configuration',
    GET_ALL_KNOWLEDGE_BASE: '/knowledge-base',
    EXTRACT_TEXT_FROM_DOCUMENT_BASE: '/utilities/extract-text-from-document',
    GET_ALL_DOCUMENTS: '/documents/get-all-documents-by-user',
    GET_ALL_DOCUMENTS_FROM_KNOWLEDGE_BASE: '/knowledge-base/get-documents-from-knowledge-base/',
    DELETE_DOCUMENT: '/documents/',
    CREATE_DOCUMENT: '/documents/upload-document',
    UPDATE_DOCUMENT: '/documents/',
    WORKERS_API: process.env.WORKERS_API || '',
    BASE_CHAT_ENDPOINTS: process.env.BACKEND_URL + '/chat'
};
