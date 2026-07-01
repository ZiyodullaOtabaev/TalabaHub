from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from planner.models import Task

User = get_user_model()


class TaskCRUDTest(TestCase):
    """Planner task CRUD testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="taskuser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_task(self):
        """Task yaratish."""
        data = {
            "title": "Matematika uy vazifasi",
            "priority": "high",
        }
        response = self.client.post("/api/planner/tasks/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.title, "Matematika uy vazifasi")
        self.assertEqual(task.priority, "high")
        self.assertFalse(task.completed)

    def test_list_tasks(self):
        """Tasklar ro'yxati."""
        Task.objects.create(user=self.user, title="Task 1")
        Task.objects.create(user=self.user, title="Task 2")
        Task.objects.create(user=self.user, title="Task 3")
        response = self.client.get("/api/planner/tasks/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 3)

    def test_complete_task(self):
        """Taskni bajarilgan deb belgilash."""
        task = Task.objects.create(user=self.user, title="Complete me")
        response = self.client.patch(
            f"/api/planner/tasks/{task.id}/",
            {"completed": True},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertTrue(task.completed)

    def test_delete_task(self):
        """Task o'chirish."""
        task = Task.objects.create(user=self.user, title="Delete me")
        response = self.client.delete(f"/api/planner/tasks/{task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_task_with_deadline(self):
        """Muddatli task yaratish."""
        deadline = timezone.now() + timezone.timedelta(days=3)
        data = {
            "title": "Deadline task",
            "deadline": deadline.isoformat(),
            "priority": "medium",
        }
        response = self.client.post("/api/planner/tasks/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.first()
        self.assertIsNotNone(task.deadline)

    def test_other_user_isolation(self):
        """Boshqa foydalanuvchi tasklarini ko'rib bo'lmaydi."""
        other = User.objects.create_user(username="other2", password="Pass123!")
        Task.objects.create(user=other, title="Other's task")
        response = self.client.get("/api/planner/tasks/")
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 0)


class TaskPriorityTest(TestCase):
    """Priority testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="priouser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_valid_priorities(self):
        """Hamma priority qiymatlar qabul qilinadi."""
        for prio in ["low", "medium", "high"]:
            response = self.client.post("/api/planner/tasks/", {
                "title": f"Task {prio}",
                "priority": prio,
            })
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_priority(self):
        """Noto'g'ri priority xato qaytaradi."""
        response = self.client.post("/api/planner/tasks/", {
            "title": "Bad priority",
            "priority": "urgent",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
