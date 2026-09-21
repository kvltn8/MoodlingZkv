"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MoodEntryViewSet, server,TaskListViewSet,QuranSurahViewset,ReciterViewset,MoodSurahViewSet, AudioViewSet

router = SimpleRouter()

router.register("moods", MoodEntryViewSet, basename="mood")
router.register("tasklists",TaskListViewSet, basename="tasklist" )
router.register("surahs",QuranSurahViewset, basename="surah")
router.register("reciters",ReciterViewset, basename="reciter" )
router.register("moodsurahs", MoodSurahViewSet, basename="moodsurah")
router.register("audios", AudioViewSet, basename="audio")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", server),
    path("", include(router.urls)),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
]
