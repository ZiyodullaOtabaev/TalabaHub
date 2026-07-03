from rest_framework import serializers
from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    """Admin uchun to'liq serializer (CRUD)."""

    is_currently_active = serializers.ReadOnlyField()
    ctr = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = (
            "id",
            "title",
            "banner_type",
            "position",
            "text_content",
            "image_url",
            "html_content",
            "link_url",
            "link_text",
            "bg_color",
            "text_color",
            "is_active",
            "priority",
            "start_date",
            "end_date",
            "impressions",
            "clicks",
            "ctr",
            "is_currently_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("impressions", "clicks", "created_at", "updated_at")

    def get_ctr(self, obj):
        """Click-Through Rate (%)."""
        if obj.impressions == 0:
            return 0
        return round((obj.clicks / obj.impressions) * 100, 2)


class PublicBannerSerializer(serializers.ModelSerializer):
    """Foydalanuvchi ko'radigan banner (faqat zarur ma'lumotlar)."""

    class Meta:
        model = Banner
        fields = (
            "id",
            "banner_type",
            "position",
            "text_content",
            "image_url",
            "html_content",
            "link_url",
            "link_text",
            "bg_color",
            "text_color",
        )
