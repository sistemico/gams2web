import os

# App
APP_NAME = 'gams2web'
DEBUG = True
SECRET_KEY = '7127af068f0f91471b4125ef2091a664b82d12c85acf7ecc'

# Web Interface
GAMS2WEB_PATH = os.path.dirname(os.path.abspath(__file__))
GAMS2WEB_DATA = os.path.join(GAMS2WEB_PATH, 'data')

# Task Queue
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'
CELERY_IMPORTS = ('gams2web',)
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
