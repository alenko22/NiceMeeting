from django.urls import path
from . import views
from .views import *

app_name = "ml_surveys"

urlpatterns = [
    path("", views.index, name="main"),
    path("rating", views.rating, name="rating"),
    path("info_change", UserInformation.as_view(), name="info_change"),
]
