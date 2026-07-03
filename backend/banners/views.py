from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Banner
from .serializers import BannerSerializer, PublicBannerSerializer


class BannerViewSet(viewsets.ModelViewSet):
    """Admin CRUD — bannerlarni boshqarish."""

    serializer_class = BannerSerializer
    permission_classes = [IsAdminUser]
    queryset = Banner.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """Bannerni yoqish/o'chirish."""
        banner = self.get_object()
        banner.is_active = not banner.is_active
        banner.save(update_fields=["is_active"])
        return Response(BannerSerializer(banner).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_banners(request):
    """Hozirda faol bannerlarni qaytarish (foydalanuvchi uchun).

    ?position=dashboard_top — faqat shu pozitsiyadagilarni olish.
    """
    position = request.query_params.get("position")
    banners = Banner.get_active_banners(position=position)

    # Impression oshirish (ko'rsatilganlar soni)
    banner_ids = list(banners.values_list("id", flat=True))
    if banner_ids:
        Banner.objects.filter(id__in=banner_ids).update(impressions=F("impressions") + 1)

    serializer = PublicBannerSerializer(banners, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def banner_click(request, banner_id):
    """Banner bosilganda click sonini oshirish."""
    Banner.objects.filter(id=banner_id).update(clicks=F("clicks") + 1)
    return Response({"detail": "ok"})
