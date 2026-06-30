from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import StudySession
from .serializers import StudySessionSerializer


class StudySessionListCreate(generics.ListCreateAPIView):
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)[:200]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def summary(request):
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)

    qs = StudySession.objects.filter(user=request.user)

    def total(queryset):
        return queryset.aggregate(s=Sum("minutes"))["s"] or 0

    # Oxirgi 7 kun bo'yicha kunlik yig'indi
    daily = []
    for i in range(6, -1, -1):
        day = today_start - timedelta(days=i)
        next_day = day + timedelta(days=1)
        minutes = total(qs.filter(created_at__gte=day, created_at__lt=next_day))
        daily.append({"date": day.date().isoformat(), "minutes": minutes})

    return Response({
        "today": total(qs.filter(created_at__gte=today_start)),
        "week": total(qs.filter(created_at__gte=week_start)),
        "all_time": total(qs),
        "daily": daily,
    })
