from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BannerViewSet, active_banners, banner_click

router = DefaultRouter()
router.register(r"manage", BannerViewSet, basename="banner-manage")

urlpatterns = [
    path("active/", active_banners, name="active-banners"),
    path("<int:banner_id>/click/", banner_click, name="banner-click"),
] + router.urls
