from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Lesson
from .permissions import IsAdminOrReadOnly
from .serializers import LessonSerializer


class LessonViewSet(viewsets.ModelViewSet):
    """Darslar CRUD.

    - GET: barcha autentifikatsiya qilingan foydalanuvchilar (category & content_lang bo'yicha filtr).
    - POST/PUT/PATCH/DELETE: faqat admin (is_staff).
    """

    serializer_class = LessonSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Lesson.objects.all()
        category = self.request.query_params.get("category")
        content_lang = self.request.query_params.get("lang")
        if category:
            qs = qs.filter(category=category)
        if content_lang:
            qs = qs.filter(content_lang=content_lang)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def watch(self, request, pk=None):
        """Video sayt ichida ochilganda ko'rishlar sonini oshiradi.

        Faqat autentifikatsiya qilingan (saytga kirgan) foydalanuvchilar
        hisoblanadi — shuning uchun bu 'saytdan ko'rganlar' soni.
        """
        lesson = self.get_object()
        Lesson.objects.filter(pk=lesson.pk).update(
            views_count=lesson.views_count + 1
        )
        lesson.refresh_from_db()
        return Response({"views_count": lesson.views_count})
