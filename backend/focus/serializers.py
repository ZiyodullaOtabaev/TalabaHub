from rest_framework import serializers

from .models import StudySession


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ("id", "minutes", "label", "created_at")
        read_only_fields = ("id", "created_at")
