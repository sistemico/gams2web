import os

# Flask
APP_NAME = 'gams2web'
DEBUG = True
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000
SECRET_KEY = '7127af068f0f91471b4125ef2091a664b82d12c85acf7ecc'

# Web Interface (NOTE: this settings will be deprecated soon)
GAMS2WEB_PATH = os.path.dirname(os.path.abspath(__file__))
GAMS2WEB_DATA = os.path.join(GAMS2WEB_PATH, 'data')

# Redis
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PASSWORD = ''

# Task Queue
QUEUE_CHANNEL_PREFIX = 'gams2web-'
QUEUE_STATUS_CHANNEL = QUEUE_CHANNEL_PREFIX + 'status'

# Celery configuration
CELERY_DEFAULT_QUEUE = 'gams2web'
CELERY_BROKER_URL = 'redis://{host}:{port}/{db}'.format(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
CELERY_RESULT_BACKEND = 'redis://{host}:{port}/{db}'.format(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
CELERY_ACCEPT_CONTENT = ['json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'
CELERY_TRACK_STARTED = True