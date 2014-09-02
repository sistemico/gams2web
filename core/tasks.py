from base64 import b64encode
from cStringIO import StringIO
import math
from uuid import uuid4
import ujson as json

from jinja2 import Environment as TemplateEnvironment, TemplateError
from gams import *
from gevent import spawn
import zmq.green as zmq

from core import data, signals


DEFAULT_CONTEXT = zmq.Context()
TASK_SOCKET = 'inproc://tasks'
RESULT_SOCKET = 'inproc://results'

TASK_SENDER = DEFAULT_CONTEXT.socket(zmq.PUSH)
TASK_SENDER.bind(TASK_SOCKET)


def run_task(model, args):
    def _send_task():
        task = data.new_task(model, args)

        # Send new task
        TASK_SENDER.send_pyobj(task)

        # Send signal
        signals.task_added.send(task)

    spawn(_send_task)


def delete_task(task):
    def _delete_task():
        data.delete_task(task)
        signals.task_deleted.send(task)

    spawn(_delete_task)


class Worker(object):
    def __init__(self, context=DEFAULT_CONTEXT, worker_id=None):
        self.id = worker_id or str(uuid4())
        self.receiver = context.socket(zmq.PULL)
        self.sender = context.socket(zmq.PUSH)

    def start(self):
        self.receiver.connect(TASK_SOCKET)
        self.sender.connect(RESULT_SOCKET)

        # On worker initialization
        signals.worker_init.send(worker_id=self.id, type=self.__class__.__name__)

        while True:
            task = self.receiver.recv_pyobj()

            # Before run task
            data.update_task_status(task, 'RUNNING')
            signals.worker_before_execution.send(self, task=task)

            try:
                # Do work
                result = self.do_work(task)

                # After run task
                data.update_task_status(task, 'SUCCESS')

                # Send result
                self.sender.send_pyobj((task, result))
            except RuntimeError:
                data.update_task_status(task, 'FAILURE')

            # After run task
            signals.worker_after_execution.send(self, task=task)

    def do_work(self, task):
        pass  # To override by subclasses


class ResultCollector(object):
    def __init__(self, context=DEFAULT_CONTEXT):
        self.receiver = context.socket(zmq.PULL)

    def start(self):
        self.receiver.bind(RESULT_SOCKET)

        while True:
            task, result = self.receiver.recv_pyobj()

            task.result = result
            data.save_task_result(task, result)
            data.update_task_status(task, 'COMPLETED')

            signals.task_completed.send(task)


#
# GAMS worker
#


class GamsWorker(Worker):
    GAMS_INSTANCE = GamsWorkspace()

    def do_work(self, task):
        try:
            output, log = [], StringIO()

            # Process task arguments
            model_parameters = {field.id: field.to_primitive() for field in task.model.parameters or []}
            task_arguments = json.loads(task.arguments)

            for field_name in set(model_parameters.keys()).intersection(task_arguments.keys()):
                if model_parameters[field_name].get('type') == 'matrix':
                    task_arguments[field_name] = [v.split(',') for v in task_arguments[field_name] if v is not None]

            # Generate model file from the template
            model_template = TemplateEnvironment().from_string(task.model.template)
            model_text = model_template.render(model_name=task.model.name, args=task_arguments)

            # Run the job with GAMS Python API
            job = self.GAMS_INSTANCE.add_job_from_string(model_text)
            job.run(output=log)

            # Collects the execution data that will be saved as results
            for symbol in job.out_db:
                out = dict(
                    name=symbol.name, description=symbol.text,
                    type=symbol.__class__.__name__[4:].lower(),
                    domains=[d if isinstance(d, basestring) else d.name for d in symbol.domains]
                )

                if isinstance(symbol, GamsEquation):
                    out['subtype'] = symbol.equtype

                elif isinstance(symbol, GamsParameter):
                    out['values'] = [dict(elements=rec.keys, value=rec.value) for rec in symbol]

                elif isinstance(symbol, GamsSet):
                    out['elements'] = [x for y in [rec.keys for rec in symbol] for x in y]

                elif isinstance(symbol, GamsVariable):
                    out['subtype'] = symbol.vartype

                if isinstance(symbol, GamsEquation) or isinstance(symbol, GamsVariable):
                    out['values'] = [dict(
                        elements=record.keys,
                        level=record.level,
                        marginal=record.marginal,
                        scale=record.scale,
                        upper=repr(record.upper) if math.isinf(record.upper) else record.upper,
                        lower=repr(record.lower) if math.isinf(record.lower) else record.lower
                    ) for record in symbol]

                output.append(out)

            # Remove license information from log file (lines 3-4)
            log = log.getvalue().splitlines(True)
            log = ''.join(log[:2] + log[4:])

            # Encoding log as Base64
            log = b64encode(log)

            return dict(output=output, log=log)
        except (TemplateError, GamsException) as error:
            raise RuntimeError(error.__class__.__name__ + ': ' + error.message)
