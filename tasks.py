from __future__ import absolute_import

from gevent import monkey

monkey.patch_all()

from base64 import b64encode
import json
from StringIO import StringIO

from celery import Celery, signals, states
from gams import *
from jinja2 import Environment as TemplateEnvironment, FileSystemLoader, TemplateError
from redis import StrictRedis

import settings


# Instance to execute jobs by GAMS API
gams = GamsWorkspace()

# Redis connection for signal emitter
redis = StrictRedis(host=settings.REDIS_HOST)

# Template engine used for model templates
model_templates = TemplateEnvironment(loader=FileSystemLoader('data'))

# Asynchronous task queue
task_queue = Celery(settings.APP_NAME, broker=settings.CELERY_BROKER_URL)
task_queue.config_from_object(settings)


#
# Helper methods
#

# Returns all tasks that are waiting to be sent to a worker
def get_pending_tasks():
    return [
        {
            'id': meta['properties'].get('correlation_id'),
            'model': meta['headers'].get('model'),
            'status': states.PENDING,
            'created': meta['headers'].get('time_sent')
        } for meta in [
            json.loads(t) for t in redis.lrange(settings.CELERY_DEFAULT_QUEUE, 0, -1)
        ]
    ]


# Returns all tasks that are waiting to be sent to a worker
def get_running_tasks():
    inspect = task_queue.control.inspect()

    active_tasks = [t for y in (inspect.active() or {}).values() for t in y]
    reserved_tasks = [t for y in (inspect.reserved() or {}).values() for t in y]
    revoked_tasks = [t for y in (inspect.revoked() or {}).values() for t in y]

    return [
        {
            'id': t.get('id'),
            'model': eval(t.get('args'))[0] if isinstance(t.get('args'), (basestring,)) else None,
            'status': task_queue.AsyncResult(t.get('id')).state,
            'created': t.get('time_start')
        } for t in (active_tasks + reserved_tasks + revoked_tasks)
    ]


# Sends revoke signal to all workers and also terminates the process currently working on the task (if any)
def cancel_task(task_id):
    task_queue.control.revoke(task_id, terminate=True)


#
# GAMS
#

var_type = [
    'Unknown', 'Binary', 'Integer', 'Positive', 'Negative', 'Free',
    'Special ordered set 1', 'Special ordered set 2', 'Semi-continuous', 'Semi-integer'
]

equ_type = [
    'Equality',
    'Greater or equal than inequality',
    'Less or equal than inequality',
    'Non-binding equation',
    'External equation',
    'Cone equation'
]


@task_queue.task(name='run_gams_model')
def run_gams_model(model_name, model_parameters):
    try:
        log = StringIO()

        # Generate model file from the template
        model_text = model_templates.get_template(model_name + '.gms').render(model_parameters)

        # Run the job with GAMS Python API
        job = gams.add_job_from_string(model_text)
        job.run(output=log)

        # Collects the execution data that will be saved as results
        output = []

        for symbol in job.out_db:
            out = dict(
                name=symbol.name, description=symbol.text,
                type=symbol.__class__.__name__[4:].lower(),
                domains=[d if isinstance(d, basestring) else d.name for d in symbol.domains]
            )

            if isinstance(symbol, GamsEquation):
                out['subtype'] = equ_type[symbol.equtype]

            elif isinstance(symbol, GamsParameter):
                out['values'] = [dict(elements=rec.keys, value=rec.value) for rec in symbol]

            elif isinstance(symbol, GamsSet):
                out['elements'] = [x for y in [rec.keys for rec in symbol] for x in y]

            elif isinstance(symbol, GamsVariable):
                out['subtype'] = var_type[symbol.vartype]

            if isinstance(symbol, GamsEquation) or isinstance(symbol, GamsVariable):
                out['values'] = [dict(
                    elements=record.keys, level=record.level, marginal=record.marginal,
                    upper=record.upper, lower=record.lower, scale=record.scale
                ) for record in symbol]

            output.append(out)

        # Remove license information from log file
        log = log.getvalue().splitlines(True)
        log = ''.join(log[:2] + log[4:])

        return dict(output=output, log=b64encode(log))
    except (TemplateError, GamsException):
        pass


#
# Signal handling
#

def send_status_signal(**kwargs):
    redis.publish(settings.QUEUE_STATUS_CHANNEL, json.dumps(kwargs))


@signals.task_prerun.connect
def before_run_task(task_id, **kwargs):
    send_status_signal(task_id=task_id, status=states.STARTED)


@signals.task_postrun.connect
def after_run_task(task_id, retval, state, **kwargs):
    send_status_signal(task_id=task_id, status=state, result=retval.get('log'))


@signals.task_retry.connect
def on_task_retry(request, **kwargs):
    send_status_signal(task_id=request.id, status=states.RETRY)


@signals.task_revoked.connect
def on_task_revoke(request, terminated, **kwargs):
    send_status_signal(task_id=request.id, status=states.REVOKED)


if __name__ == '__main__':
    task_queue.start()
