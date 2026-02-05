import requests
from datetime import datetime


class EventAPI:

    BASE_URL = 'https://api.guap.ru/data/get-nidannoconfs'

    def __init__(self, timeout=60):
        self.timeout = timeout

    def fetch_events(self):
        try:
            response = requests.get(self.BASE_URL, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API exception {e}")