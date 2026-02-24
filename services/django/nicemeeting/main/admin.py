from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import AstralSign, Message, MeetingClient, MeetingType, User, EducationalLevel

# Register your models here.

@admin.register(User)
class User(UserAdmin):
    list_display = ('id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'patronymic', 'date_birth', 'sex', 'educational_level', 'children_quantity', 'bad_habits', 'astral_sign')
    search_fields = ('id', 'password', 'last_login', 'is_superuser', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_active', 'date_joined', 'patronymic', 'date_birth', 'sex', 'educational_level', 'children_quantity', 'bad_habits')

@admin.register(AstralSign)
class AstralSignAdmin(admin.ModelAdmin):
    list_display = ('sign_id', 'sign_name')
    search_fields = ('sign_name',)

@admin.register(MeetingClient)
class MeetingClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'id_meeting_type', 'id_client', 'address', 'datetime')
    search_fields = ('id_meeting_type', 'id_client', 'address', 'datetime',)

@admin.register(MeetingType)
class MeetingTypeAdmin(admin.ModelAdmin):
    list_display = ('type_id', 'type_name')
    search_fields = ('type_name',)

@admin.register(EducationalLevel)
class EducationalLevelAdmin(admin.ModelAdmin):
    list_display = ('level_id', 'level_name')
    search_fields = ('level_name',)