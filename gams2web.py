from gevent import monkey

monkey.patch_all()

from flask import Flask
from flask.ext.socketio import SocketIO

from core.api import rest_api
from core.signals import task_added, task_completed, worker_before_execution, worker_after_execution, task_deleted
from core.commands import command_manager
import settings


# Flask application
web = Flask(__name__, static_url_path='/assets')
web.config.from_object(settings)

# REST API
web.register_blueprint(rest_api, url_prefix='/api')

# WebSocket API
socket = SocketIO(web)

# Command
manager = command_manager(web, socket)


@web.route('/')
@web.route('/<path:path>')
def index(path=''):
    # if path.startswith('api'): return abort(404)

    return web.send_static_file('views/index.html')


@socket.on('connect', namespace='/t')
def on_connect():
    socket.emit('message', 'WebSocket connected', namespace='/t')


@task_added.connect
def on_task_added(task):
    socket.emit('task:new', task.to_primitive(role='DTO'), namespace='/t')


@worker_before_execution.connect
def on_task_started(worker, task):
    socket.emit('task:status', dict(task_id=task.id, status=task.status, worker_id=worker.id), namespace='/t')


@worker_after_execution.connect
def on_task_finished(worker, task):
    socket.emit('task:status', dict(task_id=task.id, status=task.status, worker_id=worker.id), namespace='/t')


@task_completed.connect
def on_task_completed(task):
    socket.emit('task:status', dict(task_id=task.id, status=task.status), namespace='/t')


@task_deleted.connect
def on_task_deleted(task):
    socket.emit('task:delete', dict(task_id=task.id), namespace='/t')


if __name__ == "__main__":
    manager.run()
