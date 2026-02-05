import json

from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
from django.db import transaction
from django.views.generic import UpdateView
from django.http import JsonResponse

from .forms import *
from .models import *
from main.forms import *
from main.models import *

class UserInformation(UpdateView):
    template_name = 'survey/user_information.html'
    form_class = MainChangeProfilePostForm
    success_url = "rating"

    def get_object(self, queryset=None):
        return self.request.user

def index(request):
    has_missing = False
    if request.user.is_authenticated:
        user = request.user
        required_fields = [
            user.sex,
            user.bad_habits,
            user.astral_sign,
            user.educational_level,
            user.date_birth,
            user.children_quantity,
        ]
        for required_field in required_fields:
            if not required_field or str(required_field).strip() == '':
                has_missing = True

    return render(request, "survey/index.html", {
        "has_missing": has_missing,
    })

def rating(request):
    users = User.objects.exclude(id=request.user.id).filter(is_active=True)
    paginator = Paginator(users, 3)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        "users": users,
        "page_obj": page_obj,
    }
    return render(request, "survey/rate_list.html", context)

def save_rating(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            rating = data.get('rating')
            comment = data.get('comment', '')

            if not user_id or not rating:
                return JsonResponse({'success': False, 'error': 'Недостаточно данных'})

            if not 1 <= int(rating) <= 9:
                return JsonResponse({'success': False, 'error': 'Оценка должна быть от 1 до 9'})

            rated_user = get_object_or_404(User, id=user_id)

            Rating.objects.create(rater=request.user, rated_user=rated_user, rating=rating, comment=comment)

            return JsonResponse({'success': True})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Неверный метод запроса'})