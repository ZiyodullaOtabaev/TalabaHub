from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Message, Room
from .serializers import MessageSerializer, RoomSerializer


class RoomListCreate(generics.ListCreateAPIView):
    """Guruh/mavzu xonalari ro'yxati va yangi xona yaratish.

    GET: barcha foydalanuvchilar
    POST: faqat admin (is_staff)
    """

    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Room.objects.all()

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"detail": "Faqat admin yangi chat xonasi yarata oladi."},
                status=403,
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class MessageListCreate(generics.ListCreateAPIView):
    """
    GET: tanlangan xonaning oxirgi xabarlari (?room=<id>); room berilmasa — umumiy chat.
    POST: yangi xabar (room ixtiyoriy).
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        room = self.request.query_params.get("room")
        qs = Message.objects.select_related("user")
        if room:
            qs = qs.filter(room_id=room)
        else:
            qs = qs.filter(room__isnull=True)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        # Ban qilingan foydalanuvchi xabar yoza olmaydi
        if getattr(request.user, "is_banned", False):
            return Response(
                {"detail": "Sizning hisobingiz bloklangan."},
                status=403,
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageDelete(generics.DestroyAPIView):
    """Admin xabarni o'chirishi mumkin."""

    permission_classes = [permissions.IsAdminUser]
    queryset = Message.objects.all()
