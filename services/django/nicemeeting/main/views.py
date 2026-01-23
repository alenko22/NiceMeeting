from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, DetailView

from .forms import *


# class Home(DetailView):
#     template_name = 'main/index.html'

def index(request):
    return render(request, "main/index.html")

class Register(CreateView):
    form_class = MainRegisterPostForm
    template_name = "main/registration.html"
    success_url = reverse_lazy("login")

def register(request):
    if request.method == "POST":
        form = MainRegisterPostForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("home")

    else:
        form = MainRegisterPostForm()
    return render(request, "main/registration.html", {'form' : form})
def login(request):
    if request.method == "POST":
        form = MainLoginPostForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)

    else:
        form = MainLoginPostForm()
    return render(request, "main/login.html", {'form' : form})
def password_reset(request):
    if request.method == "POST":
        form = MainChangePasswordPostForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)

    else:
        form = MainChangePasswordPostForm()
    return render(request, "main/password_reset.html", {'form' : form})

class RegisterUser(CreateView):
    form_class = UserCreationForm
    template_name = "main/registration.html"
    success_url = reverse_lazy("login")