import uuid
import time


def generate_unique_process_id(prefix: str = "DOC") -> str:
    """
    Genera un ID único para procesos con un prefijo específico.

    Args:
        prefix: Prefijo para el ID (por defecto "DOC")

    Returns:
        Un string con formato {prefix}-IA-{timestamp}-{uuid}
    """
    timestamp = int(time.time())
    unique_id = str(uuid.uuid4())[:8]
    return f"{prefix}-IA-{timestamp}-{unique_id}"
