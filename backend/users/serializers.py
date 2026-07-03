from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="Bu username allaqachon band.")]
    )
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "university")

    def validate_email(self, value):
        # Bo'sh email uchun unikallik tekshirilmaydi (bir nechta foydalanuvchi
        # email kiritmasligi mumkin); faqat qiymat bo'lsa tekshiramiz.
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Bu email allaqachon ro'yxatdan o'tgan."
            )
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "university",
            "is_premium",
            "is_staff",
            "is_superuser",
            "date_joined",
        )


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Profil yangilash uchun serializer (PATCH)."""

    class Meta:
        model = User
        fields = ("username", "email", "university")
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }

    def validate_email(self, value):
        user = self.context["request"].user
        if value and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "Bu email allaqachon ro'yxatdan o'tgan."
            )
        return value

    def validate_username(self, value):
        user = self.context["request"].user
        if value and User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "Bu username allaqachon band."
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Joriy parolni bilgan holda yangi parol o'rnatish."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Joriy parol noto'g'ri.")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Parolni tiklash so'rovi — email orqali foydalanuvchini topish."""

    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Token orqali yangi parol o'rnatish."""

    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "university",
            "is_premium",
            "is_staff",
            "is_superuser",
            "is_banned",
            "ban_reason",
            "email_verified",
            "date_joined",
        )