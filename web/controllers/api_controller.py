import codecs
import json
import os

from flask import request, jsonify, abort

from web import app


# Loads
def data_from_json(filename, root=app.config['DATA_PATH']):
    with codecs.open(os.path.join(root, filename), 'rU', 'utf-8') as models_file:
        return json.load(models_file)


# Gets the all models
@app.route('/api/models', methods=["GET"])
def get_models():
    try:
        lang = 'en' if not request.args.get('lang') else request.args.get('lang')
        return jsonify(models=data_from_json('models-' + lang + '.json'))
    except IOError:
        return abort(404)


# Gets model info (e.g. /models/sudoku)
@app.route('/api/models/<model>', methods=["GET"])
def get_model(model):
    try:
        return jsonify(data_from_json(model + '.json'))
    except IOError:
        return abort(404)


# Gets the all instances
@app.route('/api/instances', methods=["GET"])
def get_instance():
    try:
        return jsonify(instances=data_from_json('instances.json'))
    except IOError:
        return abort(404)


@app.route('/api/models/<model>/instances', methods=["GET"])
def get_model_instances(model):
    try:
        all_instances = data_from_json('instances.json')
        return jsonify(instances=[i for i in all_instances if i["instance"].startswith(model)])
    except IOError:
        return abort(404)


@app.route('/api/models/<model>/instances/<instance_id>', methods=["GET"])
def get_model_instance(model, instance_id):
    try:
        all_instances = data_from_json('instances.json')
        return jsonify(instances=[i for i in all_instances if i["instance"] == model + '-' + instance_id])
    except IOError:
        return abort(404)


@app.route('/api/models/<model>/instance', methods=["POST"])
def run_model_instance(model):
    return jsonify(json.loads(request.data))
