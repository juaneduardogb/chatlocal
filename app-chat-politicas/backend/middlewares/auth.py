from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Tuple

# Importar la implementación desde dependencies.py
from app.api.dependencies import get_current_user_and_token, InvalidTokenException

# Configuración del esquema de seguridad
security = HTTPBearer()

# Aquí solo re-exportamos la función, sin reimplementarla
