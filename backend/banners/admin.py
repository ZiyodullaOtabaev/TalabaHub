from django.contrib import admin
from .models import Banner


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "position", "banner_type", "is_active", "priority", "impressions", "clicks")
    list_filter = ("position", "banner_type", "is_active")
    search_fields = ("title",)
