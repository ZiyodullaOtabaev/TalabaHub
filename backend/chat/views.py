from rest_framework import generics, permissions

from .models import Message, Room
from .serializers import MessageSerializer, RoomSerializer


class RoomListCreate(generics.ListCreateAPIView):
    """Guruh/mavzu xonalari ro'yxati va yangi xona yaratish."""

    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Room.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MessageListCreate(generics.ListCreateAPIView):
    """
    GET: tanlangan xonaning oxirgi xabarlari (?room=<id>); room berilmasa — umumiy chat.
    POST: yangi xabar (room ixtiyoriy).
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room = self.request.query_params.get("room")
        qs = Message.objects.select_related("user")
        if room:
            qs = qs.filter(room_id=room)
        else:
            qs = qs.filter(room__isnull=True)
        recent = qs.order_by("-created_at")[:200]
        return list(reversed(recent))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
