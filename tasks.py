from time import sleep

from celery import Celery

import settings


# Celery app
queue = Celery(settings.APP_NAME, broker=settings.CELERY_BROKER_URL, config_source=settings)


# Simulate task delay
@queue.task(trail=True)
def run_model(model, delay):
    sleep(delay)
    return delay
