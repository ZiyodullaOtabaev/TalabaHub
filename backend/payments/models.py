import uuid
from django.conf import settings
from django.db import models
from courses.models import Course


class Payment(models.Model):
    PROVIDER_CHOICES = [
        ("click", "Click"),
        ("payme", "Payme"),
        ("uzum", "Uzum Bank"),
        ("card", "Plastik Karta"),
    ]

    STATUS_CHOICES = [
        ("pending", "Kutilmoqda"),
        ("completed", "To'langan"),
        ("failed", "Bekor qilingan"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default="click")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    transaction_id = models.CharField(max_length=64, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TH-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} | {self.amount} so'm | {self.provider} | {self.status}"
