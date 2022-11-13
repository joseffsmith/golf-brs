import redis
from rq import Queue
from redis import Redis
from dotenv import load_dotenv
import os
load_dotenv()
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PASS = os.getenv('REDIS_PASS')


def create_connection():
    redis_conn = Redis(
        host=REDIS_HOST,
        port='38586',
        password=REDIS_PASS
    )

    q = Queue(connection=redis_conn)
    return q


if __name__ == "__main__":
    create_connection()
