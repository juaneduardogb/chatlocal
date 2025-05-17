from fastapi import Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timedelta
from collections import defaultdict
from constants import settings


limiter = Limiter(key_func=get_remote_address, default_limits=["1000/day"])
request_timestamps = defaultdict(list)


async def check_request_limit(request: Request, call_next):
    # if request.url.path == "/chat":
    #     user_ip = get_remote_address(request)
    #     current_time = datetime.utcnow()

    #     # Remove requests older than 24 hours
    #     request_timestamps[user_ip] = [timestamp for timestamp in request_timestamps[user_ip] if timestamp > current_time - timedelta(days=1)]

    #     # Check the rate limit
    #     if len(request_timestamps[user_ip]) >= settings.MAX_REQUEST_PER_IP:
    #         return Response("Rate limit exceeded", status_code=429)

    #     # Add the current request
    #     request_timestamps[user_ip].append(current_time)

    response = await call_next(request)
    return response


async def rate_limit_handler(request: Request):
    return Response(
        "Rate limit exceeded",
        status_code=429,
    )
