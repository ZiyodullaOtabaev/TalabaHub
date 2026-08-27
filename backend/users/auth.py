from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login'da username yoki email hamda ban holatini tekshirish."""

    default_error_messages = {
        "no_active_account": "Login yoki parol noto'g'ri.",
    }

    def validate(self, attrs):
        username_or_email = attrs.get("username", "").strip()

        # Username yoki email orqali foydalanuvchini topish
        if username_or_email:
            user_obj = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user_obj:
                attrs["username"] = user_obj.username

        data = super().validate(attrs)
        user = self.user

        # Ban tekshiruvi
        if getattr(user, "is_banned", False):
            reason = getattr(user, "ban_reason", "") or "Siz saytdan bloklangansiz."
            raise serializers.ValidationError(
                {"detail": f"Hisobingiz bloklangan: {reason}", "is_banned": True}
            )

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
