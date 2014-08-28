from flask.ext.script import Manager
from gevent import spawn, spawn_later

from core import data, tasks
import settings


def command_manager(app, socket):
    manager = Manager(app)

    @manager.command
    def flush_data():
        data.flush_data()

    @manager.command
    def load_models():
        data.load_model_data()

    @manager.command
    def start_result_collector():
        return spawn(tasks.ResultCollector().start)

    @manager.option('-n', '--num_workers', help='Numbers of worker processes to start')
    def start_workers(num_workers=1):
        return [spawn_later(i + 1, tasks.GamsWorker().start) for i in xrange(num_workers)]

    @manager.command
    def run_server():
        load_models()
        start_result_collector()
        start_workers(settings.NUM_WORKERS)
        socket.run(app, host=settings.SERVER_HOST, port=settings.SERVER_PORT)

    return manager
