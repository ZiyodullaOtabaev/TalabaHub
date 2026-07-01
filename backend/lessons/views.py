from rest_framework import viewsets

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
