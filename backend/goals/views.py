from datetime import date

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Goal, Habit, HabitLog
from .serializers import GoalSerializer, HabitSerializer


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).prefetch_related("logs")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """Bugungi kun uchun odat belgisini almashtirish (qo'shish/o'chirish)."""
        habit = self.get_object()
        today = date.today()
        log = HabitLog.objects.filter(habit=habit, date=today).first()
        if log:
            log.delete()
        else:
            HabitLog.objects.create(habit=habit, date=today)
        serializer = self.get_serializer(habit)
        return Response(serializer.data)
