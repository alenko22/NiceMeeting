from django.urls import path
from . import views
from .views import *

urlpatterns = [

    path("", views.index, name="home"),
    path("register", Register.as_view(), name="register"),
    path("login", Login.as_view(redirect_authenticated_user=True), name="login"),
    path("logout", views.logout_user, name="logout"),
    path("password_reset", PasswordReset.as_view(), name="password_reset"),
    path("password_reset_done", views.password_reset_done, name="password_reset_done"),
    path("password_reset_confirm/<uidb64>/<token>", PasswordResetConfirm.as_view(), name="password_reset_confirm"),
    path("password_reset_complete", views.password_reset_complete, name="password_reset_complete"),
]