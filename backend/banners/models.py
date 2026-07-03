from django.conf import settings
from django.db import models
from django.utils import timezone


class Banner(models.Model):
    """Admin tomonidan boshqariladigan e'lon/reklama bannerlari.

    Saytning turli joylarida ko'rsatiladi (dashboard, sidebar, fullwidth).
    Faol/nofaol, vaqt chegarasi, prioritet boshqariladi.
    """

    POSITION_CHOICES = [
        ("dashboard_top", "Dashboard tepasi"),
        ("dashboard_bottom", "Dashboard pastki"),
        ("sidebar", "Sidebar"),
        ("fullwidth", "To'liq kenglikda (sahifalar orasida)"),
        ("popup", "Popup (modal)"),
    ]

    TYPE_CHOICES = [
        ("image", "Rasm banner"),
        ("text", "Matnli e'lon"),
        ("html", "HTML banner"),
    ]

    title = models.CharField(max_length=255, help_text="Ichki nomi (foydalanuvchiga ko'rinmaydi)")
    banner_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="text")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default="dashboard_top")

    # Kontent
    text_content = models.TextField(blank=True, help_text="Matnli e'lon uchun")
    image_url = models.URLField(blank=True, help_text="Rasm URL manzili")
    html_content = models.TextField(blank=True, help_text="HTML banner uchun (ehtiyot bo'ling)")
    link_url = models.URLField(blank=True, help_text="Bosilganda o'tadigan havola")
    link_text = models.CharField(max_length=100, blank=True, help_text="Havola tugmasi matni")

    # Stil
    bg_color = models.CharField(max_length=50, blank=True, default="", help_text="Fon rangi (masalan: #4F46E5 yoki gradient)")
    text_color = models.CharField(max_length=20, blank=True, default="#ffffff")

    # Boshqarish
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Yuqori raqam = birinchi ko'rsatiladi")
    start_date = models.DateTimeField(null=True, blank=True, help_text="Boshlanish sanasi (bo'sh = darhol)")
    end_date = models.DateTimeField(null=True, blank=True, help_text="Tugash sanasi (bo'sh = cheksiz)")

    # Statistika
    impressions = models.PositiveIntegerField(default=0, help_text="Necha marta ko'rsatildi")
    clicks = models.PositiveIntegerField(default=0, help_text="Necha marta bosildi")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_banners",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return f"[{self.position}] {self.title}"

    @property
    def is_currently_active(self):
        """Hozirgi vaqtda faol ekanligini tekshirish."""
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

    @classmethod
    def get_active_banners(cls, position=None):
        """Hozirda faol bannerlarni qaytarish."""
        now = timezone.now()
        qs = cls.objects.filter(is_active=True)
        qs = qs.filter(
            models.Q(start_date__isnull=True) | models.Q(start_date__lte=now)
        )
        qs = qs.filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=now)
        )
        if position:
            qs = qs.filter(position=position)
        return qs.order_by("-priority", "-created_at")
