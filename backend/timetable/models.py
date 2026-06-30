from django.conf import settings
from django.db import models


class ClassSession(models.Model):
    WEEKDAYS = [
        (0, "Dushanba"),
        (1, "Seshanba"),
        (2, "Chorshanba"),
        (3, "Payshanba"),
        (4, "Juma"),
        (5, "Shanba"),
        (6, "Yakshanba"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="class_sessions",
    )
    subject = models.CharField(max_length=255)
    weekday = models.IntegerField(choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=100, blank=True)
    teacher = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["weekday", "start_time"]

    def __str__(self):
        return f"{self.subject} ({self.get_weekday_display()})"
