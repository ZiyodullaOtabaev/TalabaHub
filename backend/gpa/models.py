from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Subject(models.Model):
    # O'zbekiston OTM 5 balli baho tizimi
    GRADE_CHOICES = [
        ("5", "A'lo (5)"),
        ("4", "Yaxshi (4)"),
        ("3", "Qoniqarli (3)"),
        ("2", "Qoniqarsiz (2)"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subjects",
    )
    name = models.CharField(max_length=255)
    credit = models.IntegerField(validators=[MinValueValidator(1)])
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.grade})"
