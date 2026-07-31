from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Sum, Value
from django.db.models.functions import Round
from .models import Subject
from .serializers import SubjectSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

GRADE_POINTS = {
    # 5 ballik (O'zbekiston)
    "5": 5.0, "4": 4.0, "3": 3.0, "2": 2.0,
    # 4.0 Letter Grade (US/International)
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0,
    # ECTS (European System)
    "ECTS_A": 5.0, "ECTS_B": 4.5, "ECTS_C": 4.0, "ECTS_D": 3.5, "ECTS_E": 3.0, "ECTS_FX": 2.0, "ECTS_F": 0.0,
}


def resolve_grade_point(grade):
    if grade in GRADE_POINTS:
        return GRADE_POINTS[grade]
    try:
        val = float(grade)
        if val > 5.0:  # 100 ballik shkala
            if val >= 86: return 5.0
            if val >= 71: return 4.0
            if val >= 55: return 3.0
            return 2.0
        return val
    except (ValueError, TypeError):
        return 0.0


def _user_gpa(subjects):
    total_points = 0.0
    total_credits = 0
    for s in subjects:
        pts = resolve_grade_point(s.grade)
        total_points += pts * s.credit
        total_credits += s.credit
    gpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0
    return gpa, total_credits


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def calculate_gpa(request):
    subjects = Subject.objects.filter(user=request.user)

    gpa, total_credits = _user_gpa(subjects)

    return Response({
        "gpa": gpa,
        "scale": 5.0,
        "total_credits": total_credits,
        "subjects_count": subjects.count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """Barcha talabalarning GPA bo'yicha reytingi — DB aggregation bilan optimizatsiya qilingan."""
    from django.db.models import Case, When, DecimalField

    User = get_user_model()

    # Baho qiymatlarini DB da hisoblash uchun Case/When
    grade_case = Case(
        When(subjects__grade="5", then=Value(5.0)),
        When(subjects__grade="4", then=Value(4.0)),
        When(subjects__grade="3", then=Value(3.0)),
        When(subjects__grade="2", then=Value(2.0)),
        default=Value(0.0),
        output_field=DecimalField(max_digits=4, decimal_places=2),
    )

    # DB darajasida GPA hisoblash (weighted average)
    rows = (
        User.objects.filter(subjects__isnull=False)
        .annotate(
            total_credits=Sum("subjects__credit"),
            weighted_sum=Sum(F("subjects__credit") * grade_case),
            subjects_count=Count("subjects"),
        )
        .filter(total_credits__gt=0)
        .annotate(
            gpa=Round(F("weighted_sum") / F("total_credits"), 2),
        )
        .order_by("-gpa", "-total_credits")
        .values("username", "gpa", "total_credits", "subjects_count")[:50]
    )

    top = []
    my_rank = None
    me = request.user.username

    # Dense ranking — teng GPA bo'lsa bir xil o'rin
    current_rank = 0
    prev_gpa = None
    for i, row in enumerate(rows):
        gpa_val = float(row["gpa"])
        if gpa_val != prev_gpa:
            current_rank = i + 1
            prev_gpa = gpa_val

        entry = {
            "username": row["username"],
            "gpa": gpa_val,
            "total_credits": row["total_credits"],
            "subjects_count": row["subjects_count"],
            "rank": current_rank,
        }
        top.append(entry)
        if row["username"] == me:
            my_rank = current_rank

    # Agar men top 50 da bo'lmasam, alohida tekshirish
    if my_rank is None:
        my_data = (
            User.objects.filter(pk=request.user.pk, subjects__isnull=False)
            .annotate(
                total_credits=Sum("subjects__credit"),
                weighted_sum=Sum(F("subjects__credit") * grade_case),
            )
            .filter(total_credits__gt=0)
            .first()
        )
        if my_data and my_data.total_credits:
            my_gpa = round(float(my_data.weighted_sum) / my_data.total_credits, 2)
            # Mendan yuqori turganlar sonini hisoblash
            higher_count = (
                User.objects.filter(subjects__isnull=False)
                .annotate(
                    total_credits=Sum("subjects__credit"),
                    weighted_sum=Sum(F("subjects__credit") * grade_case),
                )
                .filter(total_credits__gt=0)
                .annotate(gpa=F("weighted_sum") / F("total_credits"))
                .filter(gpa__gt=my_gpa)
                .count()
            )
            my_rank = higher_count + 1

    return Response({
        "me": me,
        "my_rank": my_rank,
        "top": top,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def import_excel(request):
    """Excel (.xlsx) fayldan fanlarni avtomatik yuklash."""
    from .excel_import import parse_gpa_excel

    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response({"detail": "Fayl yuborilmadi (file maydoni kerak)."}, status=400)

    try:
        data = parse_gpa_excel(file_obj.read())
        if not data:
            return Response({"detail": "Excel faylidan fanlar topilmadi."}, status=400)

        created_count = 0
        for item in data:
            Subject.objects.create(
                user=request.user,
                name=item["name"],
                credit=item["credit"],
                grade=item["grade"],
                semester=item["semester"],
            )
            created_count += 1

        return Response({"detail": f"{created_count} ta fan muvaffaqiyatli yuklandi!", "imported_count": created_count})
    except Exception as e:
        return Response({"detail": f"Excel faylini o'qishda xatolik: {e}"}, status=400)