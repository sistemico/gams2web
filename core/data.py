from codecs import open
from os import listdir, path
from os.path import isfile
import ujson as json

from redis import StrictRedis
from redis.exceptions import ResponseError
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

        if isfile(file_path) and filename.endswith('.yaml'):
            with open(file_path, 'rU', 'utf-8') as descriptor_file:
                model = Model(yaml.load(descriptor_file))
                model.file = path.join(settings.DATA_ROOT, model.file or filename.replace('.yaml', '.gms'))

                if model.name and isfile(model.file):
                    # Load template
                    with open(model.file, 'rU', 'utf-8') as model_template:
                        model.template = model_template.read()

                    # Save model descriptor
                    store.set('model:{name}'.format(name=model.name), json.dumps(model.to_primitive()))


def model_exists(model_name):
    return store.exists('model:{name}'.format(name=model_name))


#
# Task
#

def get_task(task_id):
    try:
        task_data = store.get(store.scan_iter('task:*:{id}'.format(id=task_id)).next())

        return Task(json.loads(task_data)) if task_data else None
    except StopIteration:
        return None


def get_tasks(count=10, offset=0):
    return [get_task(task_id) for task_id in store.lrange('task:all', offset, offset + count - 1 if count > 0 else -1)]


def get_tasks_by_status(status, count=10):
    tasks = [json.loads(store.get(task)) for task in
             store.scan_iter('task:{status}:*'.format(status).lower(), count if count > 0 else None)]

    return [Task(task) for task in tasks if task]


def new_task(**args):
    task = Task(args)

    store.set('task:{status}:{id}'.format(id=task.id, status='PENDING').lower(), json.dumps(task.to_primitive()))
    store.lpush('task:all', task.id)

    return task


def update_task_status(task_id, new_status):
    try:
        current_key = store.scan_iter('task:*:{id}'.format(id=task_id), 1).next()
        new_key = 'task:{status}:{id}'.format(id=task_id, status=new_status).lower()

        return store.rename(current_key, new_key)
    except ResponseError:
        return False


def save_task_result(task_id, result):
    update_task_status(task_id, 'COMPLETED')
    store.set('result:{id}'.format(id=task_id), json.dumps(result))
