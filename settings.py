import os

APP_NAME = 'gams2web'
DEBUG = True

# Web Interface
GAMS2WEB_PATH = os.path.dirname(os.path.abspath(__file__))
GAMS2WEB_DATA = os.path.join(GAMS2WEB_PATH, 'data')

# Task Queue
CELERY_ACCEPT_CONTENT = ['pickle', 'json']
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERYD_CONCURRENCY = 1
