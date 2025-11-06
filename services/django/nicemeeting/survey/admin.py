from django.contrib import admin
from .models import Questionnare, User, Rating

# Register your models here.

@admin.register(Questionnare)
class QuestionnareAdmin(admin.ModelAdmin):
    list_display = ('id', 'data')
    search_fields = ('data',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'data')
    search_fields = ('data',)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('id', 'rating', 'id_user', 'id_questionnare')
    search_fields = ('rating',)