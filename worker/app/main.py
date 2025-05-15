from celery import Celery
from celery.utils.log import get_task_logger
import os

HOST_REDS = os.getenv("HOST_REDS", "redis")

REDIS_URL_BROKER = f"redis://{HOST_REDS}:6379/0"
REDIS_URL_BACKEND = f"redis://{HOST_REDS}:6379/1"

logger = get_task_logger(__name__)
workers = Celery(
    
    broker=REDIS_URL_BROKER,
    backend=REDIS_URL_BACKEND
)

@workers.task(name="workers.add")
def add(x, y):
    logger.info("Computing")
    return x + y