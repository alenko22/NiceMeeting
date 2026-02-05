import json

from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, request, JsonResponse
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.views.generic import CreateView, DetailView, ListView, UpdateView
from api.loader import EventLoader

from .forms import *
from .models import *


class Home(ListView):
    template_name = 'main/index.html'
    model = Article
    context_object_name = 'articles'

    def get_queryset(self):
        return Article.objects.all()



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

def index(request):
    return render(request, "main/index.html")


#
# def all_events(request):
#     events = Event.objects.all().order_by('date_begin')
#     return render(request, "main/all_events.html", {"events": events})

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

def privacy_policy(request):
    return render(request, "main/privacy_policy.html")

def user_agreement(request):
    return render(request, "main/user_agreement.html")

def community_rules(request):
    return render(request, "main/community_rules.html")

def public_profile(request):
    return render(request, "main/public_profile.html")

def event_details(request, event_id):
    event = get_object_or_404(Event, id = event_id)
    participants = EventUser.objects.filter(event_id = event_id).select_related('user_id')

    context = {
        "event": event,
        "participants": participants,
    }

    return render(request, "main/event_details.html", context)


def event_sign_up(request, event_id):
    try:
        event = get_object_or_404(Event, id=event_id)

        if EventUser.objects.filter(user_id=request.user.id, event_id=event_id).exists():
            return JsonResponse({
                "success": False,
                "error": "Вы уже записаны на это мероприятие"
            })

        EventUser.objects.create(
            user_id_id=request.user.id,
            event_id_id=event_id
        )

        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        })

def events(request):
    now = timezone.now()
    events = Event.objects.filter(date_begin__gte=now)
    paginator = Paginator(events, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        "events": events,
        "page_obj": page_obj,
    }
    return render(request, "main/events.html", context)
