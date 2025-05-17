# Este archivo es un punto de exportación central para todas las entidades de documentos
# Importa y exporta las clases de los archivos individuales

from .document import *
from .document_knowledge import DocumentKnowledge
from .knowledge_base import KnowledgeBase

# Aseguramos que las clases requeridas por init_db.py estén disponibles
__all__ = ['DocumentKnowledge', 'KnowledgeBase']
