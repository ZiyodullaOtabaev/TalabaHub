from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "text", "created_at")
    list_filter = ("created_at",)
    search_fields = ("text", "user__username")
