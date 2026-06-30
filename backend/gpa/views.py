from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subject
from .serializers import SubjectSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

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

    grade_points = {
        "A": 4.0,
        "B": 3.0,
        "C": 2.0,
        "D": 1.0,
        "F": 0.0,
    }

    total_points = 0.0
    total_credits = 0

    for s in subjects:
        gp = grade_points.get(s.grade, 0.0)
        total_points += gp * s.credit
        total_credits += s.credit

    gpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0

    return Response({
        "gpa": gpa,
        "total_credits": total_credits,
        "subjects_count": subjects.count(),
    })