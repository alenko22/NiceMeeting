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
    path("public_profile/<int:user_id>", views.public_profile, name="public_profile"),
    path("create_post", CreatePost.as_view(), name="create_post"),
    path("<int:post_id>/commentaries", commentaries, name="commentaries"),
    path("public_profile/<int:post_id>/delete", views.delete_post, name="delete_post"),
    path("add_comment", AddComment.as_view(), name="add_comment"),
    path("search", views.search, name="search"),
    path('chats/', views.chats_list, name='chats_list'),
    path('chats/<int:chat_id>/', views.chat_detail, name='chat_detail'),
    path('chats/<int:chat_id>/send/', views.send_message, name='send_message'),
    path('chats/create/', views.create_chat, name='create_chat'),
    path('search/users/', views.search_users, name='search_users'),
    path('meetings/', views.meetings, name='meetings'),
    path('edit_interests/', views.edit_interests, name='edit_interests'),
    path('meeting/create/', views.create_meeting, name='create_meeting'),
    path('meeting/<int:meeting_id>/', views.meeting_details, name='meeting_details'),
    path('meeting/<int:meeting_id>/edit/', views.edit_meeting, name='edit_meeting'),
    path('meeting/<int:meeting_id>/delete/', views.delete_meeting, name='delete_meeting'),

]