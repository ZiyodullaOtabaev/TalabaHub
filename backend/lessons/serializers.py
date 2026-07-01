import re

from rest_framework import serializers

from .models import Lesson

# youtu.be/ID , youtube.com/watch?v=ID , /embed/ID , /shorts/ID
_YT_RE = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/|v/))([A-Za-z0-9_-]{11})"
)


def extract_video_id(url: str) -> str:
    if not url:
        return ""
    match = _YT_RE.search(url)
    return match.group(1) if match else ""


class LessonSerializer(serializers.ModelSerializer):
    video_id = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            "id",
            "category",
            "content_lang",
            "title",
            "description",
            "youtube_url",
            "order",
            "video_id",
            "embed_url",
            "thumbnail_url",
            "created_at",
        )
        read_only_fields = ("created_by", "created_at")

    def get_video_id(self, obj):
        return extract_video_id(obj.youtube_url)

    def get_embed_url(self, obj):
        vid = extract_video_id(obj.youtube_url)
        return f"https://www.youtube.com/embed/{vid}" if vid else ""

    def get_thumbnail_url(self, obj):
        vid = extract_video_id(obj.youtube_url)
        return f"https://img.youtube.com/vi/{vid}/hqdefault.jpg" if vid else ""

    def validate_youtube_url(self, value):
        if not extract_video_id(value):
            raise serializers.ValidationError(
                "To'g'ri YouTube havolasini kiriting (masalan https://youtu.be/VIDEO_ID)."
            )
        return value
