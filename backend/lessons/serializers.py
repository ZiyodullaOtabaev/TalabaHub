import re

from rest_framework import serializers

from .models import Lesson, LessonMaterial

# youtu.be/ID , youtube.com/watch?v=ID , /embed/ID , /shorts/ID
_YT_RE = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/|v/))([A-Za-z0-9_-]{11})"
)


def extract_video_id(url: str) -> str:
    if not url:
        return ""
    match = _YT_RE.search(url)
    return match.group(1) if match else ""


class LessonMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.ReadOnlyField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = (
            "id",
            "lesson",
            "title",
            "description",
            "file",
            "file_url",
            "file_extension",
            "file_size",
            "order",
            "created_at",
        )
        read_only_fields = ("uploaded_by", "created_at")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return ""

    def get_file_size(self, obj):
        return obj.file_size_display


class LessonSerializer(serializers.ModelSerializer):
    video_id = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    has_captions = serializers.SerializerMethodField()
    materials = LessonMaterialSerializer(many=True, read_only=True)

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
            "views_count",
            "video_id",
            "embed_url",
            "thumbnail_url",
            "has_captions",
            "captions",
            "materials",
            "created_at",
        )
        read_only_fields = ("created_by", "created_at", "views_count")

    def get_video_id(self, obj):
        return extract_video_id(obj.youtube_url)

    def get_embed_url(self, obj):
        vid = extract_video_id(obj.youtube_url)
        return f"https://www.youtube.com/embed/{vid}" if vid else ""

    def get_thumbnail_url(self, obj):
        vid = extract_video_id(obj.youtube_url)
        return f"https://img.youtube.com/vi/{vid}/hqdefault.jpg" if vid else ""

    def get_has_captions(self, obj):
        return bool(obj.captions)

    def validate_youtube_url(self, value):
        if not extract_video_id(value):
            raise serializers.ValidationError(
                "To'g'ri YouTube havolasini kiriting (masalan https://youtu.be/VIDEO_ID)."
            )
        return value
