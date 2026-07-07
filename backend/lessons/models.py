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
        ("german", "Nemis tili"),
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

    # Subtitles/captions — JSON formatda vaqt belgilari bilan matn
    # Format: [{"start": 0.0, "end": 2.5, "text": "Hello everyone"}, ...]
    captions = models.JSONField(
        blank=True,
        null=True,
        default=None,
        help_text="Subtitles: [{start, end, text}, ...] yoki null",
    )

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


class LessonMaterial(models.Model):
    """Darsga tegishli hujjat (PDF, Word va boshqa fayllar).

    Admin har bir darsga aloqador PDF/Word fayllarni yuklab, tavsif yozadi.
    Foydalanuvchilar bu fayllarni yuklab olishi mumkin.
    """

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="materials",
    )
    title = models.CharField(max_length=255, help_text="Fayl nomi / sarlavha")
    description = models.TextField(blank=True, help_text="Fayl haqida qisqacha tavsif")
    file = models.FileField(
        upload_to="lesson_materials/%Y/%m/",
        help_text="PDF, Word yoki boshqa hujjat fayli",
    )
    order = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_materials",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.lesson.title})"

    @property
    def file_extension(self):
        if self.file and self.file.name:
            return self.file.name.rsplit(".", 1)[-1].lower()
        return ""

    @property
    def file_size_display(self):
        """Fayl hajmini o'qiladigan formatda qaytaradi."""
        try:
            size = self.file.size
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            else:
                return f"{size / (1024 * 1024):.1f} MB"
        except (OSError, ValueError):
            return ""
