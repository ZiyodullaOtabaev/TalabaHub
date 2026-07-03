from django.utils import timezone


class UpdateLastActiveMiddleware:
    """Autentifikatsiya qilingan foydalanuvchining last_active vaqtini yangilash.

    Performans uchun: faqat har 60 soniyada bir marta DB ga yozadi.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if hasattr(request, "user") and request.user.is_authenticated:
            now = timezone.now()
            last = request.user.last_active
            # Faqat 60 soniyadan ko'p o'tgan bo'lsa yangilaymiz
            if not last or (now - last).total_seconds() > 60:
                # update_fields bilan faqat bitta ustunni yangilaymiz (tez)
                type(request.user).objects.filter(pk=request.user.pk).update(
                    last_active=now
                )

        return response
