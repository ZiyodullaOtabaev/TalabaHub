import random
import string
import re
from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default="BookOpen")

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    LEVEL_CHOICES = [
        ("all", "Barcha darajalar"),
        ("beginner", "Boshlang'ich"),
        ("intermediate", "O'rta"),
        ("advanced", "Yuqori"),
    ]

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_courses",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="courses",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.URLField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_private = models.BooleanField(default=False)
    access_code = models.CharField(max_length=12, blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="all")
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def generate_access_code(self):
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        self.access_code = code
        return code

    def save(self, *args, **kwargs):
        if self.is_private and not self.access_code:
            self.generate_access_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    title = models.CharField(max_length=255)
    youtube_url = models.CharField(max_length=500)
    duration = models.CharField(max_length=50, blank=True, default="")
    order = models.PositiveIntegerField(default=1)
    is_preview = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "created_at"]

    @property
    def youtube_video_id(self):
        """YouTube URL dan Video ID ni ajratish."""
        if not self.youtube_url:
            return ""
        pattern = r"(?:v=|\/embed\/|\/1.1\/|\/v\/|https:\/\/youtu\.be\/|\/watch\?v=|\&v=)([^#\&\?]*)"
        match = re.search(pattern, self.youtube_url)
        return match.group(1) if match and len(match.group(1)) == 11 else self.youtube_url

    def __str__(self):
        return f"{self.course.title} — {self.order}. {self.title}"


class Enrollment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course")
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.user.username} -> {self.course.title}"
