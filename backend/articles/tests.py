from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Article

User = get_user_model()


class ArticleTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="talaba", password="parol12345")

    def _auth(self):
        self.client.force_authenticate(self.user)

    def test_create_article(self):
        self._auth()
        res = self.client.post(
            "/api/articles/articles/",
            {"title": "Test", "content": "Matn"},
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["author_username"], "talaba")

    def test_views_increment_on_retrieve(self):
        article = Article.objects.create(author=self.user, title="A", content="B")
        self._auth()
        self.client.get(f"/api/articles/articles/{article.id}/")
        article.refresh_from_db()
        self.assertEqual(article.views_count, 1)

    def test_react_toggle(self):
        article = Article.objects.create(author=self.user, title="A", content="B")
        self._auth()
        res = self.client.post(f"/api/articles/articles/{article.id}/react/")
        self.assertTrue(res.data["reacted"])
        res = self.client.post(f"/api/articles/articles/{article.id}/react/")
        self.assertFalse(res.data["reacted"])
