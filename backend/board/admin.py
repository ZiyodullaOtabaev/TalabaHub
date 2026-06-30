from django.contrib import admin

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "user", "created_at")
    list_filter = ("category",)
    search_fields = ("title", "body", "user__username")
