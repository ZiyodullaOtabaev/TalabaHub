from datetime import date, timedelta

from rest_framework import serializers

from .models import Goal, Habit


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = (
            "id",
            "title",
            "target_value",
            "current_value",
            "deadline",
            "done",
            "progress",
            "created_at",
        )
        read_only_fields = ("user", "created_at")

    def get_progress(self, obj):
        if not obj.target_value:
            return 0
        return min(100, round(obj.current_value / obj.target_value * 100))


class HabitSerializer(serializers.ModelSerializer):
    streak = serializers.SerializerMethodField()
    done_today = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = ("id", "title", "streak", "done_today", "created_at")
        read_only_fields = ("user", "created_at")

    def _log_dates(self, obj):
        return set(obj.logs.values_list("date", flat=True))

    def get_done_today(self, obj):
        return date.today() in self._log_dates(obj)

    def get_streak(self, obj):
        logs = self._log_dates(obj)
        today = date.today()
        yesterday = today - timedelta(days=1)

        if today not in logs and yesterday not in logs:
            return 0

        cursor = today if today in logs else yesterday
        streak = 0
        while cursor in logs:
            streak += 1
            cursor -= timedelta(days=1)
        return streak
