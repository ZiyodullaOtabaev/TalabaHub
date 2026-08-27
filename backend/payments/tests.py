from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from courses.models import Course, Category, Enrollment
from .models import Payment

User = get_user_model()


class PaymentsTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student_buyer",
            password="Password123!",
            email="buyer@talabahub.uz",
        )
        self.category = Category.objects.create(name="Dasturlash", slug="programming")
        self.paid_course = Course.objects.create(
            instructor=self.user,
            category=self.category,
            title="Fullstack React & Django Pro",
            price=Decimal("150000.00"),
            is_private=False,
        )
        self.free_course = Course.objects.create(
            instructor=self.user,
            category=self.category,
            title="Bepul Boshlang'ich Darslar",
            price=Decimal("0.00"),
            is_private=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_create_checkout_paid_course(self):
        response = self.client.post("/api/payments/create-checkout/", {
            "course_id": self.paid_course.id,
            "provider": "click",
            "promo_code": "TALABA10",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("transaction_id", response.data)
        self.assertEqual(response.data["discount"], 15000.0)
        self.assertEqual(response.data["amount"], 135000.0)

    def test_verify_payment_unlocks_course(self):
        # Create checkout first
        checkout_res = self.client.post("/api/payments/create-checkout/", {
            "course_id": self.paid_course.id,
            "provider": "payme",
        })
        txn_id = checkout_res.data["transaction_id"]

        # Verify payment
        verify_res = self.client.post("/api/payments/verify/", {
            "transaction_id": txn_id,
        })
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_res.data["success"])

        # Check user is now enrolled
        self.assertTrue(
            Enrollment.objects.filter(user=self.user, course=self.paid_course).exists()
        )
