from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = (
            "id",
            "username",
            "is_owner",
            "category",
            "title",
            "body",
            "contact",
            "created_at",
        )
        read_only_fields = ("id", "username", "is_owner", "created_at")

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and obj.user_id == request.user.id)
