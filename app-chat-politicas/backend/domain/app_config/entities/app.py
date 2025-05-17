from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class LoginRequest(BaseModel):
    workEmail: str


class LoginResponse(BaseModel):
    token: str
    user: Optional[Dict[str, Any]] = None


class ActionItem(BaseModel):
    id: str
    name: str
    path: str
    description: Optional[str] = None
    active: bool
    applicationId: str
    createdAt: str
    updatedAt: str


class Action(BaseModel):
    """Modelo para representar una acción del sistema"""

    action_id: int
    action_name: str
    description: Optional[str] = None
    is_function: bool = False
    active: bool = True


class Role(BaseModel):
    """Modelo para representar un rol del sistema"""

    role_id: int
    role_name: str
    active: bool = True
    actions: List[Action] = []


class UserPermissionsResponse(BaseModel):
    """Respuesta con los permisos del usuario"""

    roles: List[Role] = []

    @property
    def all_actions(self) -> List[Action]:
        """Retorna una lista plana de todas las acciones disponibles para el usuario"""
        return [action for role in self.roles if role.active for action in role.actions if action.active]

    def has_role(self, role_name: str) -> bool:
        """Verifica si el usuario tiene un rol específico"""
        return any(role.role_name.lower() == role_name.lower() and role.active for role in self.roles)

    def has_action(self, action_name: str) -> bool:
        """Verifica si el usuario tiene una acción específica"""
        return any(action.action_name == action_name and action.active for role in self.roles if role.active for action in role.actions)


class ActionResponse(BaseModel):
    """Respuesta con las acciones disponibles para un usuario (modelo anterior)"""

    actions: List[str] = []
    roles: List[str] = []
