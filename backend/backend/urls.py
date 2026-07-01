from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def home(request):
    return JsonResponse({"status": "ok", "app": "TalabaHub API"})

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/users/", include("users.urls")),
    path("api/gpa/", include("gpa.urls")),
    path("api/planner/", include("planner.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/timetable/", include("timetable.urls")),
    path("api/resources/", include("resources.urls")),
    path("api/goals/", include("goals.urls")),
    path("api/focus/", include("focus.urls")),
    path("api/board/", include("board.urls")),
    path("api/assistant/", include("assistant.urls")),
    path("api/lessons/", include("lessons.urls")),
    path("api/articles/", include("articles.urls")),
]