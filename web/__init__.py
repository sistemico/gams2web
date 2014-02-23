import os

from flask import Flask
from flask.ext.assets import Environment, Bundle


# Flask app
app = Flask(__name__)

# Configuration
app.config['ROOT_PATH'] = os.path.dirname(os.path.abspath(__file__))
app.config['DATA_PATH'] = os.path.join(app.config['ROOT_PATH'], 'data')

# Resources
assets = Environment(app)


def register_asset(asset_type, *args, **kwargs):
    assets.register(asset_type, Bundle(*args, **kwargs))
