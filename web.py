from flask import Flask

from flask.ext.socketio import SocketIO

import api


# Flask app
app = Flask(__name__, static_url_path='')
app.config.from_pyfile('settings.py')

# WebSocket
socket = SocketIO(app)

# Endpoints
socket.on_message('connect', api.connect, namespace='/api')


@app.route('/')
@app.route('/<path>')
def index(path=None):
    return app.send_static_file('views/index.html')


if __name__ == '__main__':
    socket.run(app, host='0.0.0.0')
