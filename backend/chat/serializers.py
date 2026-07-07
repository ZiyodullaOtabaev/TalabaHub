from rest_framework import serializers

from .models import Message, MessageRead, Room


class MessageReadSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = MessageRead
        fields = ("id", "username", "read_at")


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    read_count = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ("id", "username", "room", "text", "created_at", "read_count")
        read_only_fields = ("id", "username", "created_at", "read_count")

    def get_read_count(self, obj):
        if hasattr(obj, "_read_count"):
            return obj._read_count
        return obj.reads.count()

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Xabar bo'sh bo'lishi mumkin emas.")
        if len(value) > 2000:
            raise serializers.ValidationError("Xabar juda uzun (maksimal 2000 belgi).")
        return value


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ("id", "name", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Xona nomi bo'sh bo'lishi mumkin emas.")
        return value
