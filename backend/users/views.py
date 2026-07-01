from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .serializers import AdminUserSerializer, ProfileSerializer, RegisterSerializer

User = get_user_model()


class IsSuperUser(BasePermission):
    """Faqat super-admin (egasi)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """Barcha foydalanuvchilar ro'yxati — faqat adminlar (is_staff) ko'radi.

    ?search=<matn> orqali username/email bo'yicha qidirish mumkin (tez topish uchun).
    """

    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        return qs


@api_view(["POST"])
@permission_classes([IsSuperUser])
def set_admin(request, user_id):
    """Admin (is_staff) huquqini berish/olib tashlash — faqat super-admin."""
    target = get_object_or_404(User, pk=user_id)

    if target.is_superuser:
        return Response(
            {"detail": "Super-adminning huquqlarini o'zgartirib bo'lmaydi."},
            status=400,
        )

    is_admin = bool(request.data.get("is_admin"))
    target.is_staff = is_admin
    target.save(update_fields=["is_staff"])

    return Response(AdminUserSerializer(target).data)
