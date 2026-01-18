from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
from django.db import transaction
from .forms import *
from .models import *


def index(request):
    if request.method == "POST":
        form = SurveyUserPostForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)

    else:
        form = SurveyUserPostForm()
    return render(request, "survey/index.html", {'form' : form})

def rating(request):
    return render(request, "survey/rate_list.html")
