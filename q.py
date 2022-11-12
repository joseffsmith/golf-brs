from rq import Queue
from redis import Redis
import time


def create_connection():
    redis_conn = Redis(
        host='redis://default:f8c7503cb2754ee7afcaa17090294502@fly-old-dew-3410.upstash.io')
    q = Queue(connection=redis_conn)
    return q


if __name__ == "__main__":
    create_connection()
