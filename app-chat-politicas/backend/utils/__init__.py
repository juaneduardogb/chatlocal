import math
import uuid


async def convert_size(size_bytes: int):
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_name[i]}"


def generate_unique_process_id(prefix: str = "DOC"):
    random_part = uuid.uuid4().hex[:7].upper()
    return f"{prefix}-IA-{random_part}"
