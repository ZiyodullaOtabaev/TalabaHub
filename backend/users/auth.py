from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login'da ban holatini tekshirish."""

    default_error_messages = {
        "no_active_account": "Login yoki parol noto'g'ri.",
    }

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        # Ban tekshiruvi
        if user.is_banned:
            reason = user.ban_reason or "Siz saytdan bloklangansiz."
            raise serializers.ValidationError(
                {"detail": f"Hisobingiz bloklangan: {reason}", "is_banned": True}
            )

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
