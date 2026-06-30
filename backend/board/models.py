from django.conf import settings
from django.db import models


class Announcement(models.Model):
    CATEGORY_CHOICES = [
        ("book", "Kitob"),
        ("roommate", "Hamxona"),
        ("tutor", "Repetitor"),
        ("event", "Tadbir"),
        ("other", "Boshqa"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="announcements",
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    title = models.CharField(max_length=255)
    body = models.TextField()
    contact = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
