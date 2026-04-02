import json
import os

from django.contrib.auth.decorators import login_required
from django.core.management import call_command
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from main.models import PushSubscription
from .loader import EventLoader
def hello(request):
    return JsonResponse({"hello": "world", "msg": "API is alive"})

@csrf_exempt
def update_events(request):
    token = request.GET.get('token')
    if token != settings.UPDATE_SECRET_TOKEN:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    try:
        loader = EventLoader()
        count = loader.load_to_db()
        return JsonResponse({'status': 'ok', 'loaded': count})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def trigger_notifications(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Проверка секретного токена (установите переменную окружения NOTIFICATION_TOKEN)
    token = request.headers.get('Authorization')
    expected_token = os.environ.get('NOTIFICATION_TOKEN')
    if not token or token != f'Bearer {expected_token}':
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        call_command('send_notifications')
        return JsonResponse({'status': 'ok'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def push_subscribe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            endpoint = data.get('endpoint')
            p256dh = data.get('keys', {}).get('p256dh')
            auth = data.get('keys', {}).get('auth')

            if not all([endpoint, p256dh, auth]):
                return JsonResponse({'error': 'Invalid subscription data'}, status=400)

            PushSubscription.objects.update_or_create(
                user=request.user,
                endpoint=endpoint,
                defaults={'p256dh': p256dh, 'auth': auth}
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)