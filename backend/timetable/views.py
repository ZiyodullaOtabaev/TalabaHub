from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ClassSession
from .serializers import ClassSessionSerializer


class ClassSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClassSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def import_excel(request):
    """Excel (.xlsx) fayldan dars jadvalini avtomatik yuklash."""
    from .excel_import import parse_timetable_excel

    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"detail": "Fayl yuborilmadi (file maydoni kerak)."}, status=400)

    try:
        data = parse_timetable_excel(file_obj.read())
        if not data:
            return Response({"detail": "Excel faylidan darslar topilmadi."}, status=400)

        created_count = 0
        for item in data:
            ClassSession.objects.create(
                user=request.user,
                subject=item["subject"],
                weekday=item["weekday"],
                start_time=item["start_time"],
                end_time=item["end_time"],
                room=item.get("room", ""),
                teacher=item.get("teacher", ""),
            )
            created_count += 1

        return Response({"detail": f"{created_count} ta dars muvaffaqiyatli yuklandi!", "imported_count": created_count})
    except Exception as e:
        return Response({"detail": f"Excel faylini o'qishda xatolik: {e}"}, status=400)
