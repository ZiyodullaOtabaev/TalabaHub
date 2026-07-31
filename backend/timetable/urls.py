from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ClassSessionViewSet, import_excel

router = DefaultRouter()
router.register(r"sessions", ClassSessionViewSet, basename="class-sessions")

urlpatterns = [
    path("import-excel/", import_excel, name="timetable-import-excel"),
]

urlpatterns += router.urls
