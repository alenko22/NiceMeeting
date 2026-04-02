"""
URL configuration for nicemeeting project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from api.views import hello, update_events, trigger_notifications, push_subscribe
from survey.urls import app_name
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/hello/", hello),
    path("api/update_events/", update_events, name="update_events"),
    path('api/trigger-notifications/', trigger_notifications, name='trigger_notifications'),
    path('api/push/subscribe/', push_subscribe, name='push_subscribe'),

    path("", include("main.urls"), name="main"),
    path("survey/", include("survey.urls"), name="survey"),
    path("ML/", include("ML.urls"), name="ML"),
    path('sw.js', TemplateView.as_view(template_name="sw.js", content_type='application/javascript')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Для отладки можно добавить сообщение
    print(f"DEBUG режим: медиафайлы раздаются из {settings.MEDIA_ROOT}")