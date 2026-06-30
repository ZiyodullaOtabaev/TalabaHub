from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Message

User = get_user_model()


class ChatTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ali", password="StrongPass123")

    def test_requires_auth(self):
        res = self.client.get("/api/chat/messages/")
        self.assertEqual(res.status_code, 401)

    def test_send_and_list(self):
        self.client.force_authenticate(self.user)
        res = self.client.post("/api/chat/messages/", {"text": "Salom!"})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["username"], "ali")

        res = self.client.get("/api/chat/messages/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["text"], "Salom!")

    def test_empty_message_rejected(self):
        self.client.force_authenticate(self.user)
        res = self.client.post("/api/chat/messages/", {"text": "   "})
        self.assertEqual(res.status_code, 400)

    def test_messages_visible_to_all_users(self):
        Message.objects.create(user=self.user, text="Hammaga ko'rinadi")
        other = User.objects.create_user(username="vali", password="StrongPass123")
        self.client.force_authenticate(other)
        res = self.client.get("/api/chat/messages/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
