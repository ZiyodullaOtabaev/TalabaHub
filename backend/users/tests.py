from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserRegistrationTest(TestCase):
    """Ro'yxatdan o'tish testlari."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/users/register/"

    def test_register_success(self):
        """Yangi foydalanuvchi muvaffaqiyatli yaratiladi."""
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(self.url, data)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_register_password_mismatch(self):
        """Parollar mos kelmasa xato qaytadi."""
        data = {
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "StrongPass123!",
            "password2": "DifferentPass456!",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        """Takroriy username bilan ro'yxatdan o'tib bo'lmaydi."""
        User.objects.create_user(username="existing", password="pass1234!")
        data = {
            "username": "existing",
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTest(TestCase):
    """Profil testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="TestPass123!",
            university="Toshkent DTU",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        """Profil ma'lumotlari qaytadi."""
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profileuser")
        self.assertEqual(response.data["university"], "Toshkent DTU")

    def test_unauthenticated_profile(self):
        """Autentifikatsiyasiz profil ko'rib bo'lmaydi."""
        client = APIClient()
        response = client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class JWTAuthTest(TestCase):
    """JWT autentifikatsiya testlari."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="jwtuser", password="TestPass123!"
        )
        self.client = APIClient()

    def test_login_success(self):
        """To'g'ri login ma'lumotlari bilan token olinadi."""
        response = self.client.post("/api/auth/login/", {
            "username": "jwtuser",
            "password": "TestPass123!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_wrong_password(self):
        """Noto'g'ri parol bilan kirish rad etiladi."""
        response = self.client.post("/api/auth/login/", {
            "username": "jwtuser",
            "password": "WrongPassword!",
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Refresh token orqali yangi access token olinadi."""
        login = self.client.post("/api/auth/login/", {
            "username": "jwtuser",
            "password": "TestPass123!",
        })
        refresh = login.data["refresh"]
        response = self.client.post("/api/auth/refresh/", {"refresh": refresh})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
