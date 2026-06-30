from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, calculate_gpa

router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subjects")

urlpatterns = [
    path("calculate/", calculate_gpa, name="calculate-gpa"),
]

urlpatterns += router.urls