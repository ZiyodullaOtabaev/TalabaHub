from django.contrib import admin

from .models import Lesson, LessonMaterial


class LessonMaterialInline(admin.TabularInline):
    model = LessonMaterial
    extra = 1
    fields = ("title", "description", "file", "order")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "content_lang", "order", "created_at")
    list_filter = ("category", "content_lang")
    search_fields = ("title", "description")
    inlines = [LessonMaterialInline]


@admin.register(LessonMaterial)
class LessonMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "lesson", "file_extension", "order", "created_at")
    list_filter = ("lesson__category",)
    search_fields = ("title", "description", "lesson__title")
