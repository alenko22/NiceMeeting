from django.urls import path
from . import views
from .views import *

urlpatterns = [

    path("", views.index, name="home"),
    path("register", Register.as_view(), name="register"),
    path("login", views.login, name="login"),
    path("password_reset", views.password_reset, name="password_reset"),
]