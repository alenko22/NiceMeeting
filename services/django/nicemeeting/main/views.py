from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, "main/index.html")
def register(request):
    return render(request, "main/registration.html")
def login(request):
    return render(request, "main/login.html")
def password_reset(request):
    return render(request, "main/password_reset.html")