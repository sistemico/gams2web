from codecs import open
from os import listdir, path
from os.path import isfile
import ujson as json

from redis import StrictRedis
import yaml

from core.domain import Model, Task
import settings


store = StrictRedis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD
)


#
# Config
#

def get_locales():
    locales_path = path.join(settings.STATIC_ROOT, 'locales')
    return [path.splitext(f)[0] for f in listdir(locales_path) if f.endswith('.json')]


#
# Models
#

def flush_data():
    store.flushall()


def get_model(model_name):
    model_data = store.get('model:{name}'.format(name=model_name))

    return Model(json.loads(model_data)) if model_data else None


def get_models(count=0):
    return [Model(json.loads(store.get(model))) for model in store.scan_iter('model:*', count if count > 0 else None)]


def load_model_data():
    for filename in listdir(settings.DATA_ROOT):
        file_path = path.join(settings.DATA_ROOT, filename)

        if isfile(file_path) and filename.endswith('.model'):
            with open(file_path, mode='rU', encoding='utf-8') as descriptor_file:
                model = Model(yaml.load(descriptor_file))
                model.file = path.join(settings.DATA_ROOT, model.file or filename.replace('.model', '.gms'))

                if model.name and isfile(model.file):
                    # Load template
                    with open(model.file, mode='rU', encoding='utf-8') as model_template:
                        model.template = model_template.read()

                    # Save model descriptor
                    store.set('model:{name}'.format(name=model.name), json.dumps(model.to_native()))


def model_exists(model_name):
    return store.exists('model:{name}'.format(name=model_name))


#
# Task
#

def get_task(task_id):
    try:
        task_data = json.loads(store.get(store.scan_iter('task:{id}'.format(id=task_id)).next()))
        model_data = task_data.pop('model')

        task = Task(task_data)
        task.model = get_model(model_data.get('name'))
        task.status = get_task_status(task_data.get('id'))

        return task if task else None
    except StopIteration:
        return None


def get_task_status(task_id):
    return store.get('task:{id}:status'.format(id=task_id)) or 'UNKNOWN'


def get_tasks(count=10, offset=0):
    return [get_task(task_id) for task_id in store.lrange('task:all', offset, offset + count - 1 if count > 0 else -1)]


def new_task(model, args):
    task = Task({'model': model, 'arguments': args, 'status': 'PENDING'})

    store.set('task:{id}'.format(id=task.id), json.dumps(task.to_primitive()))
    store.set('task:{id}:status'.format(id=task.id), task.status)
    store.lpush('task:all', task.id)

    return task


def update_task_status(task, new_status):
    task.status = new_status
    store.set('task:{id}:status'.format(id=task.id), new_status)


def save_task_result(task, result):
    task.result = result
    store.set('task:{id}:result'.format(id=task.id), json.dumps(result))


def delete_task(task):
    store.delete('task:{id}'.format(id=task.id))
    store.delete('task:{id}:status'.format(id=task.id))
    store.delete('task:{id}:result'.format(id=task.id))
    store.lrem('task:all', 0, task.id)
