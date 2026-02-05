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
    path("settings", views.settings_page, name="settings"),
    path("profile", views.profile, name="profile"),
    path("profile/edit", ChangeProfile.as_view(), name="profile_edit"),
    path("chats", views.chats, name="chats"),
    path("events", views.events, name="events"),
    path("events/<int:event_id>", views.event_details, name="event_details"),
    path("events/<int:event_id>/signup", views.event_sign_up, name="signup" ),
    # path("all_events", views.all_events, name="all_events"),
    path("privacy_policy", views.privacy_policy, name="privacy_policy"),
    path("user_agreement", views.user_agreement, name="user_agreement"),
    path("community_rules", views.community_rules, name="community_rules"),
    path("public_profile", views.public_profile, name="public_profile"),
    path("commentaries", commentaries, name="commentaries"),
]