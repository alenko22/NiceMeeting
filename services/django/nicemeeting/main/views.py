from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
from django.core.exceptions import PermissionDenied
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, DetailView, ListView, UpdateView

from .forms import *


class Home(ListView):
    template_name = 'main/index.html'
    model = Article
    context_object_name = 'articles'

    def get_queryset(self):
        return Article.objects.all()

def index(request):
    return render(request, "main/index.html")

class Register(CreateView):
    form_class = MainRegisterPostForm
    template_name = "main/registration.html"
    success_url = reverse_lazy("login")

class Login(LoginView):
    form_class = MainLoginPostForm
    template_name = "main/login.html"
    success_url = reverse_lazy("home")

class PasswordReset(PasswordResetView):
    form_class = MainChangePasswordPostForm
    template_name = "main/password_reset.html"
    email_template_name = "main/password_reset_email.html"
    subject_template_name = "main/password_reset_subject.txt"
    html_email_template_name = None

class PasswordResetConfirm(PasswordResetConfirmView):
    form_class = MainChangePasswordConfirmPostForm
    template_name = "main/password_reset_confirm.html"
    success_url = reverse_lazy("login")

class ChangeProfile(UpdateView):
    model = User
    form_class = MainChangeProfilePostForm
    template_name = "main/profile_change.html"
    success_url = reverse_lazy("profile")
    def get_object(self, queryset=None):
        return self.request.user

class Events(ListView):
    template_name = "main/events.html"
    def get_queryset(self):
        return None
def logout_user(request):
    logout(request)
    return redirect("home")

def password_reset_complete(request):
    return render(request, "main/password_reset_complete.html")

def password_reset_done(request):
    return render(request, "main/password_reset_done.html")

def settings_page(request):
    return render(request, "main/settings.html")

def profile(request):
    return render(request, "main/profile.html")

def chats(request):
    return render(request, "main/chats.html")