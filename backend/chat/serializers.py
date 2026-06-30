from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "username", "text", "created_at")
        read_only_fields = ("id", "username", "created_at")

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Xabar bo'sh bo'lishi mumkin emas.")
        if len(value) > 2000:
            raise serializers.ValidationError("Xabar juda uzun (maksimal 2000 belgi).")
        return value
