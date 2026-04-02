# main/management/commands/send_meeting_notifications.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from main.models import Meeting
from main.notifications import send_meeting_notification

class Command(BaseCommand):
    help = 'Отправляет напоминания о встречах за 1 час, 30 минут и 15 минут'

    def handle(self, *args, **options):
        now = timezone.now()
        # Допуск в 5 минут, чтобы не пропустить из-за задержек выполнения
        tolerance = timedelta(minutes=5)

        # Проверяем встречи, которые начнутся через 1 час (±5 минут)
        target_time_1h = now + timedelta(hours=1)
        meetings_1h = Meeting.objects.filter(
            datetime__gte=target_time_1h - tolerance,
            datetime__lte=target_time_1h + tolerance,
            notification_1h_sent=False
        )
        for meeting in meetings_1h:
            send_meeting_notification(meeting, '1h')
            meeting.notification_1h_sent = True
            meeting.save(update_fields=['notification_1h_sent'])

        # Проверяем встречи, которые начнутся через 30 минут
        target_time_30m = now + timedelta(minutes=30)
        meetings_30m = Meeting.objects.filter(
            datetime__gte=target_time_30m - tolerance,
            datetime__lte=target_time_30m + tolerance,
            notification_30m_sent=False
        )
        for meeting in meetings_30m:
            send_meeting_notification(meeting, '30m')
            meeting.notification_30m_sent = True
            meeting.save(update_fields=['notification_30m_sent'])

        # Проверяем встречи, которые начнутся через 15 минут
        target_time_15m = now + timedelta(minutes=15)
        meetings_15m = Meeting.objects.filter(
            datetime__gte=target_time_15m - tolerance,
            datetime__lte=target_time_15m + tolerance,
            notification_15m_sent=False
        )
        for meeting in meetings_15m:
            send_meeting_notification(meeting, '15m')
            meeting.notification_15m_sent = True
            meeting.save(update_fields=['notification_15m_sent'])

        self.stdout.write(self.style.SUCCESS(f'Уведомления отправлены: 1ч: {meetings_1h.count()}, 30м: {meetings_30m.count()}, 15м: {meetings_15m.count()}'))