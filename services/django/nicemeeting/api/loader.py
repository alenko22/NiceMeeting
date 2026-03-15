from datetime import datetime
from django.db import transaction
from django.utils import timezone
from . import client
from main.models import Event

class EventLoader(object):
    def __init__(self):
        self.client = client.EventAPI()

    def _map_to_model(self, event):
        def make_aware(dt_str):
            if not dt_str:
                return None
            try:
                # Пытаемся распарсить ISO-строку (с T или пробелом)
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            except ValueError:
                # Если не получилось, пробуем исходный формат (на случай, если API иногда шлёт по-другому)
                try:
                    dt = datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
                except ValueError as e:
                    logger.error(f"Не удалось распарсить дату '{dt_str}': {e}")
                    return None
            # Преобразуем naive datetime в aware (UTC)
            if timezone.is_naive(dt):
                return timezone.make_aware(dt, timezone.utc)
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
        event_objs = [Event(**data) for data in events_data]

        # Массовый upsert
        Event.objects.bulk_create(
            event_objs,
            update_conflicts=True,
            update_fields=['date_begin', 'date_end', 'date_deadline', 'title', 'place', 'info'],
            unique_fields=['external_id']
        )

        # Опционально: удаляем события старше года
        from datetime import timedelta
        threshold = timezone.now() - timedelta(days=365)
        Event.objects.filter(date_end__lt=threshold).delete()

        return len(events)