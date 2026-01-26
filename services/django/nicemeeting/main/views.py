from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
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

# def register(request):
#     if request.method == "POST":
#         form = MainRegisterPostForm(request.POST)
#         if form.is_valid():
#             form.save()
#             return redirect("home")
#
#     else:
#         form = MainRegisterPostForm()
#     return render(request, "main/registration.html", {'form' : form})

class Login(LoginView):
    form_class = MainLoginPostForm
    template_name = "main/login.html"
    success_url = reverse_lazy("home")

# def login(request):
#     if request.method == "POST":
#         form = MainLoginPostForm(request.POST)
#         if form.is_valid():
#             print(form.cleaned_data)
#
#     else:
#         form = MainLoginPostForm()
#     return render(request, "main/login.html", {'form' : form})

class PasswordReset(PasswordResetView):
    form_class = MainChangePasswordPostForm
    template_name = "main/password_reset.html"
    email_template_name = "main/password_reset_email.html"
    subject_template_name = "main/password_reset_subject.txt"
    html_email_template_name = None

# def password_reset(request):
#     if request.method == "POST":
#         form = MainChangePasswordPostForm(request.POST)
#         if form.is_valid():
#             print(form.cleaned_data)
#
#     else:
#         form = MainChangePasswordPostForm()
#     return render(request, "main/password_reset.html", {'form' : form})

def logout_user(request):
    logout(request)
    return redirect("home")

class PasswordResetConfirm(PasswordResetConfirmView):
    form_class = MainChangePasswordConfirmPostForm
    template_name = "main/password_reset_confirm.html"
    success_url = reverse_lazy("login")

def password_reset_complete(request):
    return render(request, "main/password_reset_complete.html")

def password_reset_done(request):
    return render(request, "main/password_reset_done.html")