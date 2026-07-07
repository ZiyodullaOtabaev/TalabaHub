from rest_framework.routers import DefaultRouter

from .views import LessonViewSet, LessonMaterialViewSet

router = DefaultRouter()
router.register(r"items", LessonViewSet, basename="lessons")
router.register(r"materials", LessonMaterialViewSet, basename="lesson-materials")

urlpatterns = router.urls
