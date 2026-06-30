from django.contrib import admin

from .models import Goal, Habit, HabitLog

admin.site.register(Goal)
admin.site.register(Habit)
admin.site.register(HabitLog)
