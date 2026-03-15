from django.db import transaction
from django.utils import timezone
from . import client
from main.models import Event
import datetime as dt_module
import logging

logger = logging.getLogger(__name__)

class EventLoader(object):
    def __init__(self):
        self.client = client.EventAPI()

    def _map_to_model(self, event):
        def make_aware(dt_str):
            if not dt_str:
                return None
            try:
                dt = dt_module.datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            except ValueError:
                try:
                    dt = dt_module.datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
                except ValueError as e:
                    logger.error(f"Failed to parse date '{dt_str}': {e}")
                    return None
            if timezone.is_naive(dt):
                return timezone.make_aware(dt, dt_module.timezone.utc)
            return dt

        return {
            'external_id': event.get('ItemId'),
            'date_begin': make_aware(event.get('DateBegin')),
            'date_end': make_aware(event.get('DateEnd')),
            'date_deadline': make_aware(event.get('DateDeadline')),
            'title': event.get('Title'),
            'place': event.get('Place'),
            'info': event.get('Info'),
        }

    @transaction.atomic
    def load_to_db(self):
        events = self.client.fetch_events()
        events_data = [self._map_to_model(event) for event in events]
        # Убираем события, у которых external_id не определился (на всякий случай)
        events_data = [e for e in events_data if e['external_id'] is not None]
        event_objs = [Event(**data) for data in events_data]

        # Массовый upsert (требует unique constraint на external_id)
        Event.objects.bulk_create(
            event_objs,
            update_conflicts=True,
            update_fields=['date_begin', 'date_end', 'date_deadline', 'title', 'place', 'info'],
            unique_fields=['external_id']
        )

        return len(events)