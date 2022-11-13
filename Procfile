web: gunicorn views:flaskapp
clock: rqscheduler --queue-class=CustomQueue.CustomQueue --url=${RQ_REDIS_URL} --interval=8