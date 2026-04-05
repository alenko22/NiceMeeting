import json
from pywebpush import webpush, WebPushException
from django.conf import settings
from main.models import PushSubscription

def send_push_notification(user, title, body, url=None):
    subscriptions = PushSubscription.objects.filter(user=user)
    if not subscriptions:
        return

    payload = {
        'title': title,
        'body': body,
        'icon': '/static/pwa/icons/icon-192.png',
        'badge': '/static/pwa/icons/icon-192.png',
        'url': url,
        'vibrate': [200, 100, 200]
    }

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    'endpoint': sub.endpoint,
                    'keys': {'p256dh': sub.p256dh, 'auth': sub.auth}
                },
                data=json.dumps(payload),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims=settings.VAPID_CLAIMS,
                content_type='application/json'
            )
        except WebPushException as e:
            if e.response and e.response.status_code in [410, 404]:
                sub.delete()