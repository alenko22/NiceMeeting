from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import AstralSign, SocialStatus, Message, MeetingClient, MeetingType, User

# Register your models here.

# @admin.register(Client)
# class ClientAdmin(admin.ModelAdmin):
#     list_display = ('client_id', 'fio', 'date_birth', 'adress', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'astral_sign', 'social_status', 'educational_level', 'children_quantity', 'bad_habits', 'email', 'password', 'user_name')
#     search_fields = ('fio', 'date_birth', 'adress', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'astral_sign', 'social_status', 'educational_level', 'children_quantity', 'bad_habits', 'email', 'password', 'user_name')

@admin.register(User)
class User(UserAdmin):
    list_display = ('id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'patronymic', 'date_birth', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'educational_level', 'children_quantity', 'bad_habits', 'astral_sign', 'social_status')
    search_fields = ('id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'patronymic', 'date_birth', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'educational_level', 'children_quantity', 'bad_habits')

@admin.register(AstralSign)
class AstralSignAdmin(admin.ModelAdmin):
    list_display = ('sign_id', 'sign_name')
    search_fields = ('sign_name',)

@admin.register(SocialStatus)
class SocialStatusAdmin(admin.ModelAdmin):
    list_display = ('status_id', 'status_name')
    search_fields = ('status_name',)

@admin.register(MeetingClient)
class MeetingClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'id_meeting_type', 'id_client', 'address', 'datetime')
    search_fields = ('id_meeting_type', 'id_client', 'address', 'datetime',)

@admin.register(MeetingType)
class MeetingTypeAdmin(admin.ModelAdmin):
    list_display = ('type_id', 'type_name')
    search_fields = ('type_name',)