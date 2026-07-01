from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from gpa.models import Subject

User = get_user_model()


class GpaSubjectTest(TestCase):
    """GPA fanlar CRUD testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="gpauser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_subject(self):
        """Fan yaratish."""
        data = {"name": "Matematika", "credit": 4, "grade": "5"}
        response = self.client.post("/api/gpa/subjects/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Subject.objects.count(), 1)
        self.assertEqual(Subject.objects.first().name, "Matematika")

    def test_list_subjects(self):
        """Fanlar ro'yxati."""
        Subject.objects.create(user=self.user, name="Fizika", credit=3, grade="4")
        Subject.objects.create(user=self.user, name="Kimyo", credit=2, grade="5")
        response = self.client.get("/api/gpa/subjects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # paginated yoki list
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 2)

    def test_delete_subject(self):
        """Fan o'chirish."""
        subject = Subject.objects.create(
            user=self.user, name="Tarix", credit=2, grade="3"
        )
        response = self.client.delete(f"/api/gpa/subjects/{subject.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Subject.objects.count(), 0)

    def test_other_user_cannot_see(self):
        """Boshqa foydalanuvchi fanlarini ko'rib bo'lmaydi."""
        other = User.objects.create_user(username="other", password="OtherPass123!")
        Subject.objects.create(user=other, name="Biologiya", credit=3, grade="4")
        response = self.client.get("/api/gpa/subjects/")
        data = response.data.get("results", response.data)
        self.assertEqual(len(data), 0)


class GpaCalculationTest(TestCase):
    """GPA hisoblash testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="calcuser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_gpa_empty(self):
        """Fan bo'lmasa GPA 0."""
        response = self.client.get("/api/gpa/calculate/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data.get("gpa", 0)), 0)

    def test_gpa_calculation(self):
        """GPA to'g'ri hisoblanadi: (5*4 + 4*3) / (4+3) = 32/7 = 4.57."""
        Subject.objects.create(user=self.user, name="Fan1", credit=4, grade="5")
        Subject.objects.create(user=self.user, name="Fan2", credit=3, grade="4")
        response = self.client.get("/api/gpa/calculate/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        gpa = float(response.data["gpa"])
        expected = (5 * 4 + 4 * 3) / (4 + 3)
        self.assertAlmostEqual(gpa, expected, places=1)

    def test_gpa_all_excellent(self):
        """Barcha fanlar a'lo bo'lsa GPA = 5.0."""
        Subject.objects.create(user=self.user, name="A", credit=3, grade="5")
        Subject.objects.create(user=self.user, name="B", credit=4, grade="5")
        response = self.client.get("/api/gpa/calculate/")
        gpa = float(response.data["gpa"])
        self.assertEqual(gpa, 5.0)


class GpaValidationTest(TestCase):
    """GPA validatsiya testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="valuser", password="TestPass123!"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_invalid_grade(self):
        """Noto'g'ri baho qabul qilinmaydi."""
        data = {"name": "Test", "credit": 3, "grade": "6"}
        response = self.client.post("/api/gpa/subjects/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_zero_credit(self):
        """0 kredit qabul qilinmaydi."""
        data = {"name": "Test", "credit": 0, "grade": "5"}
        response = self.client.post("/api/gpa/subjects/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
