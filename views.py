from datetime import datetime, timedelta
import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import app
from q import create_connection
flaskapp = Flask(__name__)
CORS(flaskapp)

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

load_dotenv()

MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')
API_KEY = os.getenv('API_KEY')


@flaskapp.before_request
def before_request():
    if request.method == 'OPTIONS':
        return
    key = request.headers.get('X-BRS-API-KEY')
    if key != API_KEY:
        abort(401)


@flaskapp.route('/login/', methods=['GET'])
def login():
    password = request.args.get('password')
    if not password:
        abort(401, 'No password')
    try:
        app.login(password)
    except Exception as e:
        print(e)
        abort(400, 'Failed to login')

    return jsonify(status='ok')


@flaskapp.route('/curr_bookings/', methods=['GET'])
def curr_bookings():

    queue = create_connection()

    resp = jsonify(status='ok', jobs=[queue.fetch_job(
        j).to_dict()['description'] for j in queue.scheduled_job_registry.get_job_ids()])
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@flaskapp.route('/clear_bookings/', methods=['GET'])
def clear_bookings():

    resp = jsonify(status='ok')
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


@flaskapp.route('/scheduler/booking/', methods=['POST'])
def schedule_booking():
    json = request.json
    date = json['date']
    hour = str(json['hour']).zfill(2)
    minute = str(json['minute']).zfill(2)
    parsed_date = datetime.strptime(date, '%Y/%m/%d')

    # snap to 10pm
    wait_until = parsed_date.replace(hour=22) - timedelta(days=7)
    next_run_time = wait_until - timedelta(seconds=10)

    logger.debug('Booking job')

    if wait_until < datetime.now():
        logger.debug('Comp likely open, scheduling for now')
        next_run_time = datetime.now() + timedelta(seconds=30)
        wait_until = None

    queue = create_connection()

    job = queue.enqueue_at(next_run_time, app.book_job,
                           date, hour, minute, wait_until)

    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


flaskapp.debug = True

if __name__ == '__main__':
    flaskapp.run(port=5000)
