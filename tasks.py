import time

from huey import RedisHuey


queue = RedisHuey('testing', host='localhost', port=6379)


@queue.task()
def run_model(delay):
    print 'Waiting %s seconds...' % delay
    time.sleep(delay)
    print '%s seconds passed' % delay
