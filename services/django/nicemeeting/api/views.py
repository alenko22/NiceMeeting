from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
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