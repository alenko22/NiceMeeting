from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
from django.db import transaction
from django.views.generic import UpdateView

from .forms import *
from .models import *
from main.forms import *


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
    return render(request, "survey/rate_list.html")

class UserInformation(UpdateView):
    template_name = 'survey/user_information.html'
    form_class = MainChangeProfilePostForm
    reverse_lazy = "rating"

    def get_object(self, queryset=None):
        return self.request.user