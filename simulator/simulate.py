import argparse
import json
import random
import time
import requests

parser = argparse.ArgumentParser()
parser.add_argument('--server', default='http://localhost:3000')
parser.add_argument('--animalId', default='GB-sim-0001')
parser.add_argument('--period', type=float, default=5.0)
parser.add_argument('--lat', type=float, default=12.34)
parser.add_argument('--lon', type=float, default=56.78)
parser.add_argument('--drift', type=float, default=0.0005)
parser.add_argument('--breach', action='store_true')
args = parser.parse_args()

url = args.server.rstrip('/') + '/api/v1/ingest'

lat, lon = args.lat, args.lon

while True:
    # Random walk
    lat += (random.random() - 0.5) * args.drift
    lon += (random.random() - 0.5) * args.drift

    if args.breach:
        # push further away periodically
        lat += args.drift * 10
        lon += args.drift * 10

    payload = {
        'deviceId': args.animalId,
        'ts': int(time.time() * 1000),
        'location': {'lat': lat, 'lon': lon},
        'vitals': {'hr': random.randint(40, 120), 'tempC': round(random.uniform(36.0, 39.5), 1)},
        'motion': {'ax': round(random.uniform(-1, 1), 3), 'ay': round(random.uniform(-1, 1), 3), 'az': round(random.uniform(0, 1), 3)},
        'battery': round(random.uniform(3.6, 4.2), 2)
    }

    try:
        r = requests.post(url, json=payload, timeout=5)
        print('->', r.status_code, r.text)
    except Exception as e:
        print('ERR', e)

    time.sleep(args.period)
