import random
import string

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    university = models.CharField(max_length=255, blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    last_active = models.DateTimeField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=255, blank=True, default="")
    telegram_chat_id = models.CharField(max_length=50, blank=True, null=True)
    telegram_link_code = models.CharField(max_length=6, blank=True, null=True)

    def generate_telegram_code(self):
        code = "".join(random.choices(string.digits, k=6))
        self.telegram_link_code = code
        self.save(update_fields=["telegram_link_code"])
        return code

    def __str__(self):
        return self.username


class EmailVerification(models.Model):
    """Email tasdiqlash kodi — 6 raqamli kod, 15 daqiqa amal qiladi."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_codes")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    @classmethod
    def generate(cls, user):
        """Yangi 6 raqamli kod yaratish."""
        code = "".join(random.choices(string.digits, k=6))
        return cls.objects.create(user=user, code=code)

    @property
    def is_expired(self):
        """15 daqiqadan oshgan bo'lsa eskirgan hisoblanadi."""
        return (timezone.now() - self.created_at).total_seconds() > 900

    def __str__(self):
        return f"{self.user.username} — {self.code}"