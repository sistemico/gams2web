import codecs
import json
import os

from flask import request, jsonify, abort
from flask.ext.socketio import emit

import settings
from tasks import run_model


# Reads JSON file
def _load_from_json(filename, root=settings.GAMS2WEB_DATA):
    with codecs.open(os.path.join(root, filename), 'rU', 'utf-8') as json_file:
        return json.load(json_file)


def connect():
    all_tasks()
    all_models()


# Gets the list of all models
def all_models():
    lang = 'en' if not request.args.get('lang') else request.args.get('lang')
    models = _load_from_json('models-' + lang + '.json') or []
    emit('models.all', {'models': models, 'count': len(models)})


# Gets information for  a particular model
def get_model_info(name):
    pass


# Gets all instances
def all_tasks():
    tasks = _load_from_json('instances.json') or []
    emit('tasks.all', {'tasks': tasks, 'count': len(tasks)})


# Get all running instances for a given model
def get_model_instances(model):
    pass


# Simulate model execution (stub)
def run_model(model):
    from random import randint

    # Wait a random time from 1 to 20 minutes
    random_delay = randint(10, 60 * 2)

    # Execute model
    t = run_model(random_delay)

    emit('', {'id': t.task.task_id,'model': model, 'delay': random_delay})
