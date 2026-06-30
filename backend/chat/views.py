from rest_framework import generics, permissions

from .models import Message
from .serializers import MessageSerializer


class MessageListCreate(generics.ListCreateAPIView):
    """GET: oxirgi xabarlar (eskidan yangiga). POST: yangi xabar yuborish."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Oxirgi 200 ta xabarni olamiz va eskidan yangiga tartiblaymiz
        recent = Message.objects.select_related("user").order_by("-created_at")[:200]
        return list(reversed(recent))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
