import json

from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from django.db.models import Count, F, Func, Q
from django.db.models.functions import ExtractYear
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, request, JsonResponse, HttpResponseRedirect
from django.urls import reverse_lazy, reverse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.views.generic import CreateView, DetailView, ListView, UpdateView
from api.loader import EventLoader
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from datetime import date

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

class CreatePost(CreateView):
    model = Post
    form_class = MainCreatePostPostForm
    template_name = "main/create_post.html"

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy("public_profile", kwargs={"user_id": self.request.user.id})

class AddComment(CreateView):
    model = Commentaries
    form_class = MainCreateCommentPostForm
    http_method_names = ["post"]

    def form_valid(self, form):
        form.instance.author = self.request.user

        # Отладка: выводим все данные из POST
        print("POST data:", self.request.POST)
        print("Parent from POST:", self.request.POST.get('parent'))

        parent_id = self.request.POST.get("parent")
        if parent_id:
            form.instance.parent = Commentaries.objects.get(id=parent_id)

        response = super().form_valid(form)

        post = self.object.post
        post.save()

        messages.success(self.request, "Comment added successfully")

        return response

    def form_invalid(self, form):
        print("Form errors:", form.errors)

        messages.error(self.request, "Something went wrong")

        # Возвращаем редирект на предыдущую страницу
        return HttpResponseRedirect(self.request.META.get('HTTP_REFERER', '/'))

    def get_success_url(self):
        return reverse_lazy("commentaries", kwargs={"post_id": self.object.post.id})
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

def search(request):
    form = MainSearchUserForm(request.GET or None)
    users = User.objects.none()
    query_params = {}

    if form.is_valid():
        users = User.objects.all().annotate(
            age = ExtractYear(date.today()) - ExtractYear(F("date_birth")),
        )

        q = form.cleaned_data.get('q')
        if q:
            users = users.filter(
                Q(username__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q)
            )
            query_params['q'] = q

        age_min = form.cleaned_data.get('age_min')
        age_max = form.cleaned_data.get('age_max')

        if age_min:
            users = users.filter(age__gte=age_min)
            query_params['age_min'] = age_min

        if age_max:
            users = users.filter(age__lte=age_max)
            query_params['age_max'] = age_max

            # Фильтр по полу
        sex = form.cleaned_data.get('sex')
        if sex and sex != '':
            users = users.filter(sex=sex)
            query_params['sex'] = sex

        # Исключаем текущего пользователя из результатов
        if request.user.is_authenticated:
            users = users.exclude(id=request.user.id)

    paginator = Paginator(users, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        "form": form,
        "users": users,
        "page_obj": page_obj,
        "is_paginated": page_obj.has_other_pages(),
        "query_params": query_params,
    }

    return render(request, "main/search.html", context)

def public_profile(request, user_id):
    user = User.objects.get(id=user_id)
    posts = Post.objects.filter(author=user).annotate(
        comments_count=Count("comments"),
    )

    context = {
        "user": user,
        "posts": posts,
        "MEDIA_URL": settings.MEDIA_URL,
    }
    return render(request, "main/public_profile.html", context)

def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.author != request.user:
        return JsonResponse({'error': 'У вас нет прав для удаления этого поста'}, status=403)

    if request.method == "POST":
        post.delete()
        return JsonResponse({
            'success': True,
            'message': 'Пост успешно удален'
        })

    return JsonResponse({'error': 'Неверный метод запроса'}, status=405)

def commentaries(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = Commentaries.objects.filter(parent_comment__isnull=True).select_related("author").prefetch_related("replies__author").order_by("-date_posted")
    comments_count = comments.count()

    form = MainCreateCommentPostForm(initial={"post_id": post.id})

    context = {
        "post": post,
        "comments": comments,
        "form": form,
        "comments_count": comments_count,
    }
    return render(request, "main/commentaries.html", context)

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

def chats_list(request):
    user = request.user
    chats = Chat.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).select_related("user1", "user2")

    chat_data = []

    for chat in chats:
        other_user = chat.get_other_user(user)
        last_message = chat.get_last_message()

        chat_data.append({
            "chat": chat,
            "other_user": other_user,
            "last_message": last_message,
            "unread_count": chat.messages.filter(recipient=user, is_read=False).count(),
        })

    context = {
        "chats": chat_data,
        "current_user": user,
    }

    return render(request, "main/chats.html", context)

def chat_detail(request, chat_id):
    user = request.user
    chat = get_object_or_404(Chat, id=chat_id)

    if user not in [chat.user1, chat.user2]:
        return redirect("chats_list")

    other_user = chat.get_other_user(user)

    # Отмечаем сообщения как прочитанные
    Message.objects.filter(chat=chat, recipient=user, is_read=False).update(is_read=True)

    messages = chat.messages.all()

    # === ВАЖНО: Получаем список ВСЕХ чатов пользователя для левой панели ===
    chats = Chat.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).select_related("user1", "user2")

    chat_data = []
    for c in chats:
        other = c.get_other_user(user)
        last_message = c.get_last_message()
        chat_data.append({
            "chat": c,
            "other_user": other,
            "last_message": last_message,
            "unread_count": c.messages.filter(recipient=user, is_read=False).count(),
        })

    context = {
        "chat": chat,  # Текущий чат для правой панели
        "other_user": other_user,
        "messages": messages,
        "current_user": user,
        "chats": chat_data,  # Список всех чатов для левой панели
        "current_chat_id": chat.id,  # Для выделения активного чата
    }

    return render(request, "main/chats.html", context)


# views.py
def send_message(request, chat_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user = request.user
    chat = get_object_or_404(Chat, id=chat_id)

    if user not in [chat.user1, chat.user2]:
        return JsonResponse({'error': 'Access denied'}, status=403)

    # Получаем текст из textarea
    text = request.POST.get('text', '').strip()

    if not text:
        return JsonResponse({'error': 'Message text is required'}, status=400)

    recipient = chat.get_other_user(user)

    message = Message.objects.create(
        chat=chat,
        sender=user,
        recipient=recipient,
        text=text
    )

    return JsonResponse({
        'success': True,
        'message': {
            'id': message.id,
            'text': message.text,
            'datetime': message.datetime.isoformat(),
            'sender_id': user.id,
            'sender_username': user.username,
            'is_sent': True
        }
    })


def create_chat(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user = request.user
    recipient_id = request.POST.get('recipient_id')

    if not recipient_id:
        return JsonResponse({'error': 'Recipient ID is required'}, status=400)

    try:
        recipient = get_user_model().objects.get(id=recipient_id)
    except get_user_model().DoesNotExist:
        return JsonResponse({'error': 'Recipient not found'}, status=404)

    if user == recipient:
        return JsonResponse({'error': 'Cannot chat with yourself'}, status=400)

    chat, created = Chat.objects.get_or_create(
        user1=user,
        user2=recipient,
        defaults={'user1': user, 'user2': recipient}
    )

    return JsonResponse({
        'success': True,
        'chat_id': chat.id,
        'redirect_url': reverse('chat_detail', kwargs={'chat_id': chat.id})
    })


def search_users(request):
    """Поиск пользователей по полнотекстовому индексу"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    query = request.GET.get('q', '').strip()

    if not query:
        return JsonResponse({
            'success': True,
            'users': []
        })

    # Получаем текущего пользователя
    current_user = request.user

    # Ищем пользователей с использованием полнотекстового поиска
    # Предполагаем, что у пользователя есть поля: username, first_name, last_name, patronymic
    users = get_user_model().objects.annotate(
        search=SearchVector(
            'username',
            'first_name',
            'last_name',
            'patronymic',
        ),
        rank=SearchRank(
            SearchVector('username', 'first_name', 'last_name', 'patronymic', config='russian'),
            SearchQuery(query, config='russian')
        )
    ).filter(
        search=SearchQuery(query, config='russian')
    ).exclude(
        id=current_user.id
    ).order_by('-rank')[:15]

    # Исключаем пользователей, с которыми уже есть чат
    existing_chat_recipients = Chat.objects.filter(
        Q(user1=current_user) | Q(user2=current_user)
    ).values_list('user1_id', 'user2_id')

    existing_ids = set()
    for user1_id, user2_id in existing_chat_recipients:
        if user1_id != current_user.id:
            existing_ids.add(user1_id)
        if user2_id != current_user.id:
            existing_ids.add(user2_id)

    # Фильтруем пользователей
    users = [user for user in users if user.id not in existing_ids]

    users_data = [{
        'id': user.id,
        'username': user.username,
        'first_name': getattr(user, 'first_name', ''),
        'last_name': getattr(user, 'last_name', ''),
        'patronymic': getattr(user, 'patronymic', ''),
        'full_name': f"{getattr(user, 'last_name', '')} {getattr(user, 'first_name', '')} {getattr(user, 'patronymic', '')}".strip() or user.username,
    } for user in users]

    return JsonResponse({
        'success': True,
        'users': users_data
    })

def meetings(request):

    meetings = Meeting.objects.filter(user1=request.user).select_related("user2", "event").order_by("-datetime")
    paginator = Paginator(meetings, 8)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'meetings': meetings,
    }

    return render(request, "main/meetings.html", context)
