from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Subject

User = get_user_model()


class GpaCalculationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="ali", password="StrongPass123"
        )
        self.client.force_authenticate(self.user)

    def test_calculate_gpa_weighted(self):
        # (3*5 + 2*4) / (3+2) = 23/5 = 4.6
        Subject.objects.create(user=self.user, name="Matematika", credit=3, grade="5")
        Subject.objects.create(user=self.user, name="Fizika", credit=2, grade="4")

        res = self.client.get("/api/gpa/calculate/")

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["gpa"], 4.6)
        self.assertEqual(res.data["scale"], 5.0)
        self.assertEqual(res.data["total_credits"], 5)
        self.assertEqual(res.data["subjects_count"], 2)

    def test_calculate_gpa_empty(self):
        res = self.client.get("/api/gpa/calculate/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["gpa"], 0.0)

    def test_subjects_are_user_scoped(self):
        other = User.objects.create_user(username="vali", password="StrongPass123")
        Subject.objects.create(user=other, name="Boshqa", credit=4, grade="5")

        res = self.client.get("/api/gpa/subjects/")

        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 0)

    def test_negative_credit_rejected(self):
        res = self.client.post(
            "/api/gpa/subjects/",
            {"name": "Test", "credit": -2, "grade": "5"},
        )
        self.assertEqual(res.status_code, 400)
