from scheduler import background_sched_add_jobs
from datetime import datetime, timedelta
import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import app
import pymongo
flaskapp = Flask(__name__)
CORS(flaskapp)

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

load_dotenv()

MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')
# API_SECRET = os.getenv('API_SECRET')


# @flaskapp.before_request
# def before_request():
#     if request.method == 'OPTIONS':
#         return
#     key = request.headers.get('X-MS-JS-API-KEY')
#     if key != API_SECRET:
#         abort(401)


@flaskapp.route('/curr_bookings/', methods=['GET'])
async def curr_bookings():

    background_sched_add_jobs.start()
    jobs = background_sched_add_jobs.get_jobs()
    background_sched_add_jobs.shutdown()

    resp = jsonify(status='ok', jobs=[
                   (j.id, j.next_run_time) for j in jobs])
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@flaskapp.route('/scheduler/booking/', methods=['POST'])
async def schedule_booking():
    json = request.json
    date = json['date']
    hour = json['hour']
    minute = json['minute']
    parsed_date = datetime.strptime(date, '%Y/%m/%d')
    booking_date = parsed_date.replace(hour=22) - timedelta(days=7)

    background_sched_add_jobs.start()
    background_sched_add_jobs.add_job(
        app.book_job,
        id=f'{date}-{hour}:{minute}',
        args=[date, hour, minute],
        replace_existing=True,
        next_run_time=booking_date,
        misfire_grace_time=None,
    )

    background_sched_add_jobs.shutdown()

    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


flaskapp.debug = True

if __name__ == '__main__':
    flaskapp.run(port=5000)
