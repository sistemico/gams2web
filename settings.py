import os

# App
APP_NAME = 'gams2web'
DEBUG = True
SECRET_KEY = '7127af068f0f91471b4125ef2091a664b82d12c85acf7ecc'

# Web Interface
GAMS2WEB_PATH = os.path.dirname(os.path.abspath(__file__))
GAMS2WEB_DATA = os.path.join(GAMS2WEB_PATH, 'data')
