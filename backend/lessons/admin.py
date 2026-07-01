from django.contrib import admin

from .models import Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "content_lang", "order", "created_at")
    list_filter = ("category", "content_lang")
    search_fields = ("title", "description")
