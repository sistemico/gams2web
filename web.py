from flask import Flask

from flask.ext.assets import Environment
from flask.ext.socketio import SocketIO

import api


# Flask app
app = Flask(__name__, static_url_path='')
app.config.from_pyfile('settings.py')

# Resources
assets = Environment(app)

# WebSocket
socket = SocketIO(app)

# Main page (with support to Angular HTML5 routes mode)
app.add_url_rule('/', 'root', lambda: app.send_static_file('views/index.html'))
app.add_url_rule('/<path>', 'index', lambda path: app.send_static_file('views/index.html'))

# Endpoints
socket.on_message('connect', api.connect, namespace='/api')


# Start local web server
if __name__ == '__main__':
    socket.run(app, host='0.0.0.0')
