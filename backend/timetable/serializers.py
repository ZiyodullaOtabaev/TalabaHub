from rest_framework import serializers

from .models import ClassSession


class ClassSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSession
        fields = "__all__"
        read_only_fields = ("user",)

    def validate(self, data):
        start = data.get("start_time")
        end = data.get("end_time")
        if start and end and end <= start:
            raise serializers.ValidationError(
                "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak."
            )
        return data
