from os import path

# Flask
APP_NAME = 'gams2web'
DEBUG = True
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000
SECRET_KEY = '7127af068f0f91471b4125ef2091a664b82d12c85acf7ecc'

# Paths
APP_ROOT = path.dirname(path.abspath(__file__))
DATA_ROOT = path.join(APP_ROOT, 'models')
STATIC_ROOT = path.join(APP_ROOT, 'static')

# Task queue
NUM_WORKERS = 3

# Redis
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PASSWORD = None
