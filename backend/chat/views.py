from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Message, MessageRead, Room
from .serializers import MessageSerializer, MessageReadSerializer, RoomSerializer


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


class RoomDelete(generics.DestroyAPIView):
    """Admin yoki xona yaratuvchisi xonani o'chirishi mumkin."""

    permission_classes = [permissions.IsAuthenticated]
    queryset = Room.objects.all()

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()
        if not request.user.is_staff and room.created_by != request.user:
            return Response(
                {"detail": "Faqat admin yoki xona muallifi xonani o'chira oladi."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


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


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request):
    """Xabarlarni o'qildi deb belgilash.

    Body: {"message_ids": [1, 2, 3]}
    Har bir xabar uchun MessageRead yozuvi yaratiladi (agar mavjud bo'lmasa).
    """
    message_ids = request.data.get("message_ids", [])
    if not message_ids:
        return Response({"detail": "message_ids kerak."}, status=status.HTTP_400_BAD_REQUEST)

    # Faqat mavjud xabarlar uchun
    existing = Message.objects.filter(id__in=message_ids).values_list("id", flat=True)
    # Allaqachon o'qilganlarni chiqarib tashlash
    already_read = set(
        MessageRead.objects.filter(
            message_id__in=existing, user=request.user
        ).values_list("message_id", flat=True)
    )
    new_reads = [
        MessageRead(message_id=mid, user=request.user)
        for mid in existing
        if mid not in already_read
    ]
    if new_reads:
        MessageRead.objects.bulk_create(new_reads, ignore_conflicts=True)

    return Response({"marked": len(new_reads)})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def message_readers(request, pk):
    """Muayyan xabarni kim o'qiganini ko'rsatish.

    GET /api/chat/messages/<pk>/readers/
    Faqat xabar egasi ko'rishi mumkin.
    """
    try:
        message = Message.objects.get(pk=pk)
    except Message.DoesNotExist:
        return Response({"detail": "Xabar topilmadi."}, status=status.HTTP_404_NOT_FOUND)

    # Faqat xabar egasi kim o'qiganini ko'radi
    if message.user_id != request.user.id:
        return Response({"detail": "Faqat o'z xabaringiz uchun."}, status=status.HTTP_403_FORBIDDEN)

    reads = MessageRead.objects.filter(message=message).select_related("user")
    serializer = MessageReadSerializer(reads, many=True)
    return Response(serializer.data)
