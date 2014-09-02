from flask import Blueprint, abort, current_app, jsonify, request

from core import data, tasks


rest_api = Blueprint('rest_api', __name__)


def _paginate(items, **options):
    offset = options.get('offset', 0)
    count = options.get('count', 0)
    items = items[offset:offset + count if count > 0 else None]

    return dict(objects=items, metadata=dict(count=len(items), offset=offset))


@rest_api.route('/config')
def get_config():
    return jsonify(app_name=current_app.config['APP_NAME'], locales=data.get_locales())


#
# Models
#

@rest_api.route('/models')
def get_models():
    i18n = request.args.get('locale', 'en')
    return jsonify(_paginate([model.to_primitive(role='DTO', context={'locale': i18n}) for model in data.get_models()]))


@rest_api.route('/models/<model_name>')
def get_model(model_name):
    model = data.get_model(model_name)
    i18n = request.args.get('locale', 'en')

    return jsonify(model.to_primitive(role='DTO', context={'locale': i18n})) if model else abort(404)


@rest_api.route('/models/<model_name>', methods=['POST'])
def run_model(model_name):
    if data.model_exists(model_name):
        tasks.run_task(model=data.get_model(model_name), args=request.data if request.data else '')

        return '', 202
    else:
        abort(404)


#
# Tasks
#

@rest_api.route('/tasks')
def get_tasks(count=10, offset=0):
    tasks = [task.to_primitive(role='DTO') for task in data.get_tasks(count, offset)]

    return jsonify(dict(objects=tasks, metadata=dict(count=len(tasks), offset=offset)))


@rest_api.route('/tasks/<task_id>')
def get_task(task_id):
    task = data.get_task(task_id)

    return jsonify(task.to_primitive(role='DTO')) if task else abort(404)


@rest_api.route('/tasks/<task_id>', methods=['DELETE'])
def remove_task(task_id):
    task = data.get_task(task_id)

    if task:
        tasks.delete_task(task)

    return '', 202


@rest_api.route('/tasks/<task_id>/result')
def get_task_result(task_id):
    result = data.get_task_result(task_id)

    return jsonify(result) if result else abort(404)
