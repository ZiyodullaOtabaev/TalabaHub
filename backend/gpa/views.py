from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Sum, Value
from django.db.models.functions import Round
from .models import Subject
from .serializers import SubjectSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# O'zbekiston OTM 5 balli baho tizimi
GRADE_POINTS = {
    "5": 5.0,
    "4": 4.0,
    "3": 3.0,
    "2": 2.0,
}


def _user_gpa(subjects):
    total_points = 0.0
    total_credits = 0
    for s in subjects:
        total_points += GRADE_POINTS.get(s.grade, 0.0) * s.credit
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

    for i, row in enumerate(rows):
        entry = {
            "username": row["username"],
            "gpa": float(row["gpa"]),
            "total_credits": row["total_credits"],
            "subjects_count": row["subjects_count"],
            "rank": i + 1,
        }
        top.append(entry)
        if row["username"] == me:
            my_rank = i + 1

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