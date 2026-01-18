from django.urls import path
from . import views

app_name = "ml_surveys"

urlpatterns = [
    path("", views.index, name="main"),
    path("/rating", views.rating, name="rating"),
]
