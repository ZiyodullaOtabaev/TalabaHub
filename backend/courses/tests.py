from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category, Course, Lesson, Enrollment

User = get_user_model()


class CoursesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="teacher1",
            email="teacher1@example.com",
            password="Password123!",
        )
        self.student = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="Password123!",
        )
        self.category = Category.objects.create(name="IELTS", slug="ielts")

    def test_create_public_course(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/courses/", {
            "title": "IELTS Speaking Masterclass",
            "description": "Complete speaking preparation",
            "category": self.category.id,
            "price": "0.00",
            "is_private": False,
            "lessons": [
                {
                    "title": "1-Dars. Introduction",
                    "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
                    "duration": "10 min",
                }
            ]
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)
        self.assertEqual(Lesson.objects.count(), 1)

    def test_create_private_course_and_access(self):
        self.client.force_authenticate(user=self.user)
        course = Course.objects.create(
            instructor=self.user,
            category=self.category,
            title="Maxfiy Nemis Tili Kursi",
            is_private=True,
        )

        # Maxfiy kod yaratilganligini tekshirish
        self.assertTrue(len(course.access_code) == 6)

        # Student noto'g'ri kod kiritsa
        self.client.force_authenticate(user=self.student)
        res_fail = self.client.post(f"/api/courses/{course.id}/access-private/", {
            "access_code": "WRONG1"
        })
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # Student to'g'ri kod kiritsa
        res_success = self.client.post(f"/api/courses/{course.id}/access-private/", {
            "access_code": course.access_code
        })
        self.assertEqual(res_success.status_code, status.HTTP_200_OK)
        self.assertTrue(Enrollment.objects.filter(user=self.student, course=course).exists())
