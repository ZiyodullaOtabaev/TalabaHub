from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """O'qish (GET) hamma autentifikatsiya qilingan foydalanuvchilarga ochiq.

    Yozish (POST/PUT/PATCH/DELETE) faqat admin (is_staff) uchun.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff)
