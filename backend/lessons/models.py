from django.conf import settings
from django.db import models


class Lesson(models.Model):
    """YouTube video darsi.

    Admin (is_staff) YouTube havolasini joylaydi, foydalanuvchilar sayt ichida ko'radi.
    Har bir dars bo'limga (category) va tilga (content_lang) tegishli.
    """

    CATEGORY_CHOICES = [
        ("growth", "Shaxsiy rivojlanish"),
        ("ielts", "IELTS"),
    ]

    LANG_CHOICES = [
        ("uz", "O'zbek"),
        ("en", "Ingliz"),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    content_lang = models.CharField(max_length=2, choices=LANG_CHOICES, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    youtube_url = models.URLField()
    order = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lessons",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"[{self.category}/{self.content_lang}] {self.title}"
