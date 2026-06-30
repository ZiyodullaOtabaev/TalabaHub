from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "subject", "created_at")
    search_fields = ("title", "subject", "user__username")
