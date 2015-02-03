from flask.ext.script import Manager
from gevent import spawn, spawn_later, joinall

from core import data
from core.tasks import GamsWorker, ResultCollector
import settings


def command_manager(app, socket):
    manager = Manager(app)

    @manager.command
    def flush_data():
        data.flush_data()

    @manager.command
    def load_models():
        return spawn(data.load_model_data)

    @manager.command
    def start_result_collector():
        return spawn(ResultCollector().start)

    @manager.option('-n', '--num_workers', help='Numbers of worker processes to start')
    def start_workers(num_workers=1):
        return [spawn_later(i + 1, GamsWorker().start) for i in xrange(num_workers)]

    @manager.command
    def run_server():
        try:
            sub_commands = [
                load_models(),
                start_result_collector(),
                start_workers(settings.NUM_WORKERS)
            ]

            socket.run(app, host=settings.SERVER_HOST, port=settings.SERVER_PORT)
        except KeyboardInterrupt:
            pass

        joinall(sub_commands)

    return manager
