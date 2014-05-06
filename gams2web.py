from __future__ import absolute_import

from datetime import datetime as date

from flask import Flask
from flask.ext.socketio import SocketIO, emit
from jinja2 import Environment, FileSystemLoader
from celery import Celery
from celery.signals import task_prerun, task_postrun

from data import models, tasks


#
# Flask app
#

app = Flask(__name__, static_url_path='/assets')
app.config.from_pyfile('settings.py')


@app.route('/')
@app.route('/<path:resource>')
def index(resource=''):
    return app.send_static_file('views/index.html')


#
# Endpoints (WebSocket API)
#

socket = SocketIO(app)


@socket.on('connect', namespace='/api')
def on_connect():
    send_all_models()
    send_all_tasks()


@socket.on('model:all', namespace='/api')
def send_all_models():
    emit('model:all', {'models': models, 'count': len(models)})


@socket.on('model:get', namespace='/api')
def send_model_info(model_name):
    try:
        model = next(m for m in models if m['name'] == model_name or None)
        emit('model:' + model_name, model)
    except StopIteration:
        pass


@socket.on('model:run', namespace='/api')
def run_model(model):
    task = run_gams_model.apply_async((model['name'], {'test': model['title']}))
    task_info = {'id': task.id, 'model': model['title'], 'status': task.status, 'submitDate': date.now().isoformat()}
    emit('task:new', task_info, broadcast=True)


@socket.on('task:all', namespace='/api')
def send_all_tasks():
    emit('task:all', {'tasks': tasks, 'count': len(tasks)})


@socket.on('task:cancel', namespace='/api')
def cancel_task(task_id):
    # TODO: Cancel task
    emit('task:canceled', task_id)


@task_prerun.connect()
def task_running(task_id, task, **kwargs):
    emit('task:status', {'id': task_id, 'status': task.status}, broadcast=True)


@task_postrun.connect()
def task_done(task_id, task, **kwargs):
    emit('task:status', {'id': task_id, 'status': task.status}, broadcast=True)
    emit('task:result', {'result': 'dummy data'}, broadcast=True)


#
# Tasks
#

# Task queue
task_queue = Celery(app.config['APP_NAME'], broker=app.config['CELERY_BROKER_URL'])
task_queue.config_from_object(app.config)

# Models templates
model_templates = Environment(loader=FileSystemLoader('data/models'))


@task_queue.task()
def run_gams_model(model_name, model_parameters):
    model_template = model_templates.get_template(model_name + '.gms')

    return model_template.render(model_parameters)


if __name__ == '__main__':
    socket.run(app, host='0.0.0.0')
