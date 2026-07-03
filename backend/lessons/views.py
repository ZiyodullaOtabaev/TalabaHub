import re

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Lesson
from .permissions import IsAdminOrReadOnly
from .serializers import LessonSerializer


def parse_srt(content: str) -> list:
    """SRT formatdagi matnni [{start, end, text}, ...] ga aylantiradi."""
    blocks = re.split(r"\n\s*\n", content.strip())
    captions = []
    time_re = re.compile(
        r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})"
    )
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 2:
            continue
        # Vaqt qatorini topamiz
        time_match = None
        text_start = 0
        for i, line in enumerate(lines):
            m = time_re.search(line)
            if m:
                time_match = m
                text_start = i + 1
                break
        if not time_match:
            continue
        h1, m1, s1, ms1, h2, m2, s2, ms2 = time_match.groups()
        start = int(h1) * 3600 + int(m1) * 60 + int(s1) + int(ms1) / 1000
        end = int(h2) * 3600 + int(m2) * 60 + int(s2) + int(ms2) / 1000
        text = " ".join(lines[text_start:]).strip()
        # HTML teglarini olib tashlash
        text = re.sub(r"<[^>]+>", "", text)
        if text:
            captions.append({"start": round(start, 3), "end": round(end, 3), "text": text})
    return captions


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
        """Video sayt ichida ochilganda ko'rishlar sonini oshiradi."""
        lesson = self.get_object()
        Lesson.objects.filter(pk=lesson.pk).update(
            views_count=lesson.views_count + 1
        )
        lesson.refresh_from_db()
        return Response({"views_count": lesson.views_count})

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def upload_captions(self, request, pk=None):
        """SRT/VTT formatdagi captionni parse qilib saqlash.

        Body: {"srt": "1\\n00:00:00,000 --> 00:00:02,500\\nHello..."}
        yoki {"captions": [{start, end, text}, ...]} — to'g'ridan-to'g'ri JSON.
        """
        lesson = self.get_object()

        # To'g'ridan-to'g'ri JSON formatda yuborilsa
        if "captions" in request.data:
            captions = request.data["captions"]
            if not isinstance(captions, list):
                return Response({"detail": "captions ro'yxat bo'lishi kerak."}, status=400)
            lesson.captions = captions
            lesson.save(update_fields=["captions"])
            return Response({"detail": "Captionlar saqlandi.", "count": len(captions)})

        # SRT/VTT formatda yuborilsa
        srt_content = request.data.get("srt", "")
        if not srt_content:
            return Response(
                {"detail": "srt yoki captions maydoni talab qilinadi."},
                status=400,
            )

        captions = parse_srt(srt_content)
        if not captions:
            return Response(
                {"detail": "SRT formatdan hech qanday caption ajratib olinmadi."},
                status=400,
            )

        lesson.captions = captions
        lesson.save(update_fields=["captions"])
        return Response({"detail": "Captionlar saqlandi.", "count": len(captions)})

    @action(detail=True, methods=["delete"], permission_classes=[IsAdminUser])
    def delete_captions(self, request, pk=None):
        """Captionlarni o'chirish."""
        lesson = self.get_object()
        lesson.captions = None
        lesson.save(update_fields=["captions"])
        return Response({"detail": "Captionlar o'chirildi."})
