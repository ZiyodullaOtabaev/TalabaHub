from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
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
    """Barcha talabalarning GPA bo'yicha reytingi (faqat fan kiritganlar)."""
    User = get_user_model()
    rows = []
    users = User.objects.prefetch_related("subjects").all()
    for u in users:
        subjects = list(u.subjects.all())
        if not subjects:
            continue
        gpa, total_credits = _user_gpa(subjects)
        if total_credits == 0:
            continue
        rows.append({
            "username": u.username,
            "gpa": gpa,
            "total_credits": total_credits,
            "subjects_count": len(subjects),
        })

    rows.sort(key=lambda r: (-r["gpa"], -r["total_credits"]))

    for i, row in enumerate(rows):
        row["rank"] = i + 1

    me = request.user.username
    my_rank = next((r["rank"] for r in rows if r["username"] == me), None)

    return Response({
        "me": me,
        "my_rank": my_rank,
        "top": rows[:50],
    })