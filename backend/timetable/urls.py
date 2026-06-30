from rest_framework.routers import DefaultRouter

from .views import ClassSessionViewSet

router = DefaultRouter()
router.register(r"sessions", ClassSessionViewSet, basename="class-sessions")

urlpatterns = router.urls
