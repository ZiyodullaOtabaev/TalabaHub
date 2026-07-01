from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from goals.models import Goal, Habit

User = get_user_model()


class GoalTest(TestCase):
    """Maqsadlar testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="goaluser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_goal(self):
        """Maqsad yaratish."""
        data = {
            "title": "IELTS 7.0 olish",
            "target_value": 70,
            "current_value": 55,
        }
        response = self.client.post("/api/goals/goals/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)

    def test_list_goals(self):
        """Maqsadlar ro'yxati."""
        Goal.objects.create(user=self.user, title="Goal 1", target_value=100)
        Goal.objects.create(user=self.user, title="Goal 2", target_value=50)
        response = self.client.get("/api/goals/goals/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 2)

    def test_update_progress(self):
        """Maqsad progressini yangilash."""
        goal = Goal.objects.create(
            user=self.user, title="Progress goal", target_value=100, current_value=0
        )
        response = self.client.patch(
            f"/api/goals/goals/{goal.id}/",
            {"current_value": 50},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertEqual(goal.current_value, 50)

    def test_mark_done(self):
        """Maqsadni bajarilgan deb belgilash."""
        goal = Goal.objects.create(
            user=self.user, title="Done goal", target_value=100
        )
        response = self.client.patch(
            f"/api/goals/goals/{goal.id}/",
            {"done": True},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertTrue(goal.done)


class HabitTest(TestCase):
    """Odatlar testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="habituser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_habit(self):
        """Odat yaratish."""
        data = {"title": "Har kuni 30 daqiqa kitob o'qish"}
        response = self.client.post("/api/goals/habits/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Habit.objects.count(), 1)

    def test_list_habits(self):
        """Odatlar ro'yxati."""
        Habit.objects.create(user=self.user, title="Habit 1")
        Habit.objects.create(user=self.user, title="Habit 2")
        response = self.client.get("/api/goals/habits/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 2)
