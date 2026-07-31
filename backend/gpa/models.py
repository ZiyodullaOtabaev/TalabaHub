from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Subject(models.Model):
    SEMESTER_CHOICES = [(str(i), f"{i}-semestr") for i in range(1, 9)]
    SCALE_CHOICES = [
        ("5", "5 ballik (O'zbekiston)"),
        ("4", "4.0 Letter Grade (US/International)"),
        ("100", "100 ballik shkala"),
        ("ects", "ECTS (Yevropa tizimi)"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subjects",
    )
    name = models.CharField(max_length=255)
    credit = models.IntegerField(validators=[MinValueValidator(1)])
    grade = models.CharField(max_length=10)
    scale_type = models.CharField(max_length=10, choices=SCALE_CHOICES, default="5")
    semester = models.CharField(max_length=2, choices=SEMESTER_CHOICES, default="1")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["semester", "name"]

    def __str__(self):
        return f"{self.name} ({self.grade}) - {self.semester}-sem"
