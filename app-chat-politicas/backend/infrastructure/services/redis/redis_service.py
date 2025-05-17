import redis
import json
from typing import Any, Optional

from constants import settings


class RedisService:
    _instance = None
    _redis_client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisService, cls).__new__(cls)

            # Conexión a Redis usando el patrón Singleton
            cls._redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                ssl=True,
            )
        return cls._instance

    @classmethod
    def get_connection(cls):
        """Retorna la conexión a Redis"""
        if cls._redis_client is None:
            cls()
        return cls._redis_client

    @classmethod
    async def save_token(cls, email: str, token: str, expiration_time: int = 86400):
        """
        Guarda un token en Redis usando el token como llave

        Args:
            email: Correo del usuario como llave
            token: Token a guardar en cache
            expiration_time: Tiempo de expiración en segundos (por defecto 24 horas)
        """
        try:
            redis_client = cls.get_connection()
            redis_client.setex(token, expiration_time, email)
            return True
        except Exception as e:
            print(f"Error al guardar en Redis: {str(e)}")
            return False

    @classmethod
    async def get_token(cls, token: str) -> Optional[str]:
        """
        Obtiene un email desde Redis usando el token como llave

        Args:
            token: Token del usuario como llave

        Returns:
            El email si existe, None si no
        """
        try:
            redis_client = cls.get_connection()
            email = redis_client.get(token)
            if email is not None:
                return email.decode("utf-8")
            return None
        except Exception as e:
            print(f"Error al obtener de Redis: {str(e)}")
            return None

    @classmethod
    async def delete_token(cls, token: str) -> bool:
        """
        Elimina un token de Redis usando el token como llave

        Args:
            token: Token a eliminar de cache

        Returns:
            True si se eliminó correctamente, False si no
        """
        try:
            redis_client = cls.get_connection()
            redis_client.delete(token)
            return True
        except Exception as e:
            print(f"Error al eliminar de Redis: {str(e)}")
            return False

    @classmethod
    async def verify_token(cls, token: str) -> Optional[str]:
        """
        Verifica si un token es válido y devuelve el email asociado

        Args:
            token: Token a verificar

        Returns:
            El email asociado al token si es válido, None si no
        """
        if not token:
            return None

        # Si el token viene con formato "Bearer <token>"
        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "")

        try:
            email = await cls.get_token(token)
            return email
        except Exception as e:
            print(f"Error al verificar token: {str(e)}")
            return None
