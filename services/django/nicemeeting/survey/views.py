from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
from django.db import transaction


def index(request):
    return render(request, "survey/index.html")
