from datetime import datetime
import json
from os import listdir, path

from gevent import monkey, spawn


monkey.patch_all()

from flask import Flask, jsonify, abort
from flask.ext.socketio import SocketIO

from redis import StrictRedis as Redis

# Internal modules
import tasks
import models
import settings


# Flask application
app = Flask(__name__, static_url_path='/assets')
app.config.from_object(settings)


@app.route('/')
@app.route('/<path:resource>')
def index(resource=None):
    return app.send_static_file('views/index.html')


#
# Resources (REST API)
#

@app.route('/api/config')
def get_app_configuration():
    locales_path = path.join(app.static_folder, 'locales')
    locales = [path.splitext(f)[0] for f in listdir(locales_path) if f.endswith('.json')]

    return jsonify(app=settings.APP_NAME, locales=locales)


@app.route('/api/models')
def get_all_models():
    return jsonify(models.get_all_models())


@app.route('/api/models/<model_name>')
def get_model(model_name):
    model = models.get_model_by_name(model_name)
    return jsonify(model) if model else abort(404)


# @app.route('/api/models/<model_name>/run')
# def run_model_rest(model_name):
#     task = tasks.run_gams_model.apply(args=(model_name, {'title': model_name}))
#     return jsonify(id=task.id, result=task.result, status=task.status)


@app.route('/api/tasks')
def get_all_tasks():
    return jsonify({t['id']: t for t in tasks.get_pending_tasks() + tasks.get_running_tasks()})


@app.route('/api/tasks/<task_id>')
def get_task(task_id):
    all_tasks = {t['id']: t for t in tasks.get_pending_tasks() + tasks.get_running_tasks()}
    return jsonify(all_tasks.get(task_id) or abort(404))


#
# Endpoints (WebSocket API)
#

socket = SocketIO(app)


@socket.on('run model')
def run_model(model):
    metadata = dict(created=datetime.now().isoformat(), model=model.get('name'))
    task = tasks.run_gams_model.apply_async(args=(metadata['model'], model), headers=metadata)
    metadata.update(dict(id=task.id, status=task.status))
    socket.emit('new task', metadata)


@socket.on('cancel task')
def cancel_task(task_id):
    tasks.cancel_task(task_id)


#
# Signals
#

def process_signals():
    redis = Redis(host=settings.REDIS_HOST)

    publisher = redis.pubsub()
    publisher.subscribe(settings.QUEUE_STATUS_CHANNEL)

    while True:
        # Process task queue signals from workers
        for message in publisher.listen():
            if message['type'].endswith('message'):
                socket.emit('task status update', json.loads(message['data']))


#
# Helpers
#

# Paginate list
def _paginate(items, options=None):
    options = options if options else {}
    offset = options.get('offset', 0)
    count = options.get('count', None)
    items = items[offset:offset + count if count > 0 else None]

    return dict(items=items, count=len(items), offset=offset)


if __name__ == '__main__':
    # Runs the task queue signals processor
    spawn(process_signals)

    # Starts the WSGI web server that handles the Flask application with SocketIO support
    socket.run(app, host=settings.SERVER_HOST, port=settings.SERVER_PORT)
