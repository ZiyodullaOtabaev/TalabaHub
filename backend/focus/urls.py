from django.urls import path

from .views import StudySessionListCreate, summary

urlpatterns = [
    path("sessions/", StudySessionListCreate.as_view(), name="focus-sessions"),
    path("summary/", summary, name="focus-summary"),
]
