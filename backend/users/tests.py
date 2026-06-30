from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterTests(APITestCase):
    def test_register_success(self):
        res = self.client.post(
            "/api/users/register/",
            {
                "username": "newuser",
                "email": "new@example.com",
                "password": "StrongPass123",
                "university": "TATU",
            },
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_short_password(self):
        res = self.client.post(
            "/api/users/register/",
            {"username": "shorty", "password": "123"},
        )
        self.assertEqual(res.status_code, 400)

    def test_register_duplicate_username(self):
        User.objects.create_user(username="dup", password="StrongPass123")
        res = self.client.post(
            "/api/users/register/",
            {"username": "dup", "password": "StrongPass123"},
        )
        self.assertEqual(res.status_code, 400)

    def test_two_users_without_email_allowed(self):
        # Regress test: bo'sh email bilan ikkinchi foydalanuvchi ham
        # ro'yxatdan o'ta olishi kerak (avval UniqueValidator buni bloklardi).
        r1 = self.client.post(
            "/api/users/register/",
            {"username": "u1", "password": "StrongPass123"},
        )
        r2 = self.client.post(
            "/api/users/register/",
            {"username": "u2", "password": "StrongPass123"},
        )
        self.assertEqual(r1.status_code, 201)
        self.assertEqual(r2.status_code, 201)

    def test_me_requires_auth(self):
        res = self.client.get("/api/users/me/")
        self.assertEqual(res.status_code, 401)
