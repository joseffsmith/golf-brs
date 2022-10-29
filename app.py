import requests
import bs4
from dotenv import load_dotenv
import os
import pause
load_dotenv()

USERNAME = os.getenv('BRS_USERNAME')
PASSWORD = os.getenv('BRS_PASSWORD')
BASE_URL = os.getenv('BASE_URL')


def book_job(date, hour, minute, wait):
    time = f"{str(hour).zfill(2)}:{minute}"
    session = requests.Session()
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0'
    session.headers = {'User-Agent': user_agent}
    print('Getting login page...')
    resp = session.get('https://members.brsgolf.com/thevalehotelspa/login')
    print('Get login page: ', resp)
    b = bs4.BeautifulSoup(resp.content, features='html.parser')

    token = b.find(attrs={'id': 'login_form__token'}).get('value')

    print('Logging in...')
    resp = session.post('https://members.brsgolf.com/thevalehotelspa/login', data={
        'login_form[username]': USERNAME,
        'login_form[password]': PASSWORD,
        'login_form[login]': '',
        'login_form[_token]': token
    })
    print('Logging in: ', resp)

    pause.until(wait)
    # wait until it's the time specified
    print(f'Getting tee times for {date}...')
    resp = session.get(
        f'https://members.brsgolf.com/thevalehotelspa/tee-sheet/data/1/{date}')
    print('Got tee times: ', resp)
    data = resp.json()

    times = data['times']

    booking = times[time]['tee_time']
    if not booking['bookable']:
        raise Exception('Cannot book, is booked')

    if booking['reservation']:
        raise Exception("Part booking, don't do it")

    print('Booking: ', booking)

    url = BASE_URL + booking['url']

    print('Getting booking page...')
    resp = session.get(url)
    print('Got booking page: ', resp)

    b = bs4.BeautifulSoup(resp.content, features='html.parser')

    token = b.find(attrs={'name': 'member_booking_form[token]'}).get('value')
    _token = b.find(attrs={'id': 'member_booking_form__token'}).get('value')

    print('Booking...')
    resp = session.post(f"https://members.brsgolf.com/thevalehotelspa/bookings/store/1/{date.replace('/', '')}/{time.replace(':', '')}", data={
        "member_booking_form[token]": token,
        "member_booking_form[player_1]": 1102,
        "member_booking_form[player_2]": 1103,
        "member_booking_form[player_3]": 1104,
        "member_booking_form[player_4]": 1105,
        "member_booking_form[vendor-tx-code]": "",
        "member_booking_form[_token]": _token
    })
    print('Booked: ', resp)
