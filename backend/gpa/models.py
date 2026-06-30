from django.db import models
from django.conf import settings

class Subject(models.Model):
    GRADE_CHOICES = [
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
        ("F", "F"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=255)
    credit = models.IntegerField()
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.grade})"