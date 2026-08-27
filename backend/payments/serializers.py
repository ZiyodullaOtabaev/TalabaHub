from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "course",
            "course_title",
            "amount",
            "provider",
            "status",
            "transaction_id",
            "created_at",
        ]
        read_only_fields = ["id", "user", "status", "transaction_id", "created_at"]
