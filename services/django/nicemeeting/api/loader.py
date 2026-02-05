from datetime import datetime
from django.db import transaction
from . import client
from main.models import Event

class EventLoader(object):
    def __init__(self):
        self.client = client.EventAPI()

    def _map_to_model(self, event):
        return {
            'external_id': event.get('ItemId'),
            'date_begin': event.get('DateBegin'),
            'date_end': event.get('DateEnd'),
            'date_deadline': event.get('DateDeadline'),
            'title': event.get('Title'),
            'place': event.get('Place'),
            'info': event.get('Info'),
        }

    @transaction.atomic
    def load_to_db(self):
        events = self.client.fetch_events()
        for event in events:
            mapped_event = self._map_to_model(event)

            Event.objects.update_or_create(
                external_id = mapped_event['external_id'],
                defaults = mapped_event
            )

        return len(events)