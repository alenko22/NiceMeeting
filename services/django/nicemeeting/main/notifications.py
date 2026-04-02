# notifications.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from api.management.commands import push_notifications


def send_meeting_notification(meeting, notification_type):
    """
    Отправляет уведомление о встрече всем участникам.
    notification_type: 'new', '1h', '30m', '15m'
    """
    # Получаем всех участников встречи (user1 + user2)
    participants = list(meeting.user1.all()) + [meeting.user2]
    # Уникальные пользователи (на случай дублирования)
    participants = set(participants)

    # Определяем тему и шаблон в зависимости от типа уведомления
    if notification_type == 'new':
        subject = f'Новая встреча: {meeting.event.title if meeting.event else "личная встреча"}'
        template_name = 'email/meeting_new.html'
    elif notification_type == '1h':
        subject = f'Напоминание: встреча через 1 час'
        template_name = 'email/meeting_reminder.html'
    elif notification_type == '30m':
        subject = f'Напоминание: встреча через 30 минут'
        template_name = 'email/meeting_reminder.html'
    elif notification_type == '15m':
        subject = f'Напоминание: встреча через 15 минут'
        template_name = 'email/meeting_reminder.html'
    else:
        return

    for user in participants:
        # Проверяем настройки уведомлений пользователя
        if not user.settings.email_notifications:  # предполагаем, что UserSettings связан через user.settings
            continue

        # Формируем контекст для шаблона
        context = {
            'user': user,
            'meeting': meeting,
            'notification_type': notification_type,
            'site_url': settings.SITE_URL,  # добавьте в settings переменную с базовым URL сайта
        }
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)

        # Отправляем email
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )

    for user in participants:
        if user.settings.push_notifications:
            subject = f'Встреча: {meeting.event.title if meeting.event else "личная встреча"}'
            # Формируем текст в зависимости от типа
            if notification_type == 'new':
                if meeting.event:
                    body = f'Вам назначена встреча на мероприятии "{meeting.event.title}".'
                else:
                    body = f'Вам назначена встреча в {meeting.place} в {meeting.datetime.strftime("%H:%M")}.'
            elif notification_type == '1h':
                body = 'Встреча через 1 час!'
            elif notification_type == '30m':
                body = 'Встреча через 30 минут!'
            elif notification_type == '15m':
                body = 'Встреча через 15 минут!'
            else:
                continue

            push_notifications.send_push_notification(user, subject, body, url=f'/meeting/{meeting.id}/')
