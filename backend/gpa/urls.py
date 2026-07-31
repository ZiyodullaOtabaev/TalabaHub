from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, calculate_gpa, leaderboard, import_excel

router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subjects")

urlpatterns = [
    path("calculate/", calculate_gpa, name="calculate-gpa"),
    path("leaderboard/", leaderboard, name="leaderboard"),
    path("import-excel/", import_excel, name="gpa-import-excel"),
]

urlpatterns += router.urls