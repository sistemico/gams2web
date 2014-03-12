from flask import Flask, render_template

from flask.ext.assets import Environment
from flask.ext.socketio import SocketIO

import api


# Flask app
app = Flask(__name__)
app.config.from_pyfile('settings.py')

# Resources
assets = Environment(app)

# WebSocket
socket = SocketIO(app)

# Routes
app.add_url_rule('/', 'index', lambda: render_template('main.html'))
# app.add_url_rule('/api/models', 'model.all', api.get_models, methods=['GET'])
# app.add_url_rule('/api/models/<model>', 'model.get', api.get_model, methods=['GET'])
# app.add_url_rule('/api/models/<model>/instances', 'model.instances', api.get_model_instances, methods=['GET'])
# app.add_url_rule('/api/instances', 'instances.all', api.get_instances, methods=['GET'])
# app.add_url_rule('/api/models/<model>/instances/<task_id>', 'instances.get', api.get_model_instance, methods=['GET'])
# app.add_url_rule('/api/models/<model>/run', 'model.run', api.run_model_instance, methods=['POST', 'PUT'])

# Endpoints
socket.on_message('connect', api.connect, namespace='/api')


# Start local web server
if __name__ == '__main__':
    socket.run(app, host='0.0.0.0')
