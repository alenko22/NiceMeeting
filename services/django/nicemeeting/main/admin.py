from django.contrib import admin
from .models import Client, AstralSign, SocialStatus, Message, MeetingClient, MeetingType

# Register your models here.

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'fio', 'date_birth', 'adress', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'astral_sign', 'social_status', 'educational_level', 'children_quantity', 'bad_habits')
    search_fields = ('fio', 'date_birth', 'adress', 'sex', 'height', 'weight', 'hair_color', 'eye_color', 'astral_sign', 'social_status', 'educational_level', 'children_quantity', 'bad_habits',)

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