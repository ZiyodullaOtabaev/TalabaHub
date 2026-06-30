from rest_framework.routers import DefaultRouter

from .views import ResourceViewSet

router = DefaultRouter()
router.register(r"items", ResourceViewSet, basename="resources")

urlpatterns = router.urls
