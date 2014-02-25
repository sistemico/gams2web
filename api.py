import codecs
import json
import os

from flask import request, jsonify, abort

import settings


# Reads JSON file
def _data_from_json(filename, root=settings.GAMS2WEB_DATA):
    with codecs.open(os.path.join(root, filename), 'rU', 'utf-8') as json_file:
        return json.load(json_file)


# Gets the all models
def get_models():
    try:
        lang = 'en' if not request.args.get('lang') else request.args.get('lang')
        return jsonify(models=_data_from_json('models-' + lang + '.json'))
    except IOError:
        return abort(404)


# Gets information for of a particular model
def get_model(model):
    try:
        return jsonify(_data_from_json(model + '.json'))
    except IOError:
        return abort(404)


# Gets all instances
def get_instances():
    try:
        return jsonify(instances=_data_from_json('instances.json'))
    except IOError:
        return abort(503)


# Get all running instances for a given model
def get_model_instances(model):
    try:
        all_instances = _data_from_json('instances.json')
        return jsonify(instances=[i for i in all_instances if i["instance"].startswith(model)])
    except IOError:
        return abort(404)


#
def get_model_instance(model, task_id):
    try:
        all_instances = _data_from_json('instances.json')
        return jsonify(instances=[i for i in all_instances if i["instance"] == model + '-' + task_id])
    except IOError:
        return abort(404)


#
def run_model_instance(model):
    return jsonify(json.loads(request.data))
