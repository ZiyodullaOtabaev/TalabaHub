from django.contrib import admin

from .models import ClassSession


@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ("subject", "user", "weekday", "start_time", "end_time", "room")
    list_filter = ("weekday",)
    search_fields = ("subject", "teacher", "user__username")
