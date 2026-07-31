from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Category, Course, Lesson, Enrollment
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CreateCourseSerializer,
    LessonSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CreateCourseSerializer
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=["views_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        qs = Course.objects.all()
        user = self.request.user

        search = self.request.query_params.get("search")
        category_id = self.request.query_params.get("category")
        level = self.request.query_params.get("level")
        is_private = self.request.query_params.get("is_private")

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if category_id:
            qs = qs.filter(category_id=category_id)
        if level:
            qs = qs.filter(level=level)

        if is_private == "true":
            if user.is_authenticated:
                qs = qs.filter(Q(is_private=True, instructor=user) | Q(is_private=True, enrollments__user=user)).distinct()
            else:
                qs = Course.objects.none()
        elif is_private == "false":
            qs = qs.filter(is_private=False)
        else:
            if user.is_authenticated:
                qs = qs.filter(Q(is_private=False) | Q(instructor=user) | Q(enrollments__user=user)).distinct()
            else:
                qs = qs.filter(is_private=False)

        return qs

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


@api_view(["GET"])
@permission_classes([AllowAny])
def top_viewed_videos(request):
    """Platformadagi ko'rishlar soni bo'yicha TOP 5 eng ko'p ko'rilgan video darslar / kurslar."""
    lessons = Lesson.objects.select_related("course").order_by("-views_count", "-created_at")[:5]
    if lessons.count() == 0:
        courses = Course.objects.filter(is_private=False).order_by("-views_count", "-created_at")[:5]
        return Response(CourseListSerializer(courses, many=True, context={"request": request}).data)

    serializer = LessonSerializer(lessons, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def increment_lesson_views(request, pk):
    """Video dars ko'rilganida views_count ni 1 ga oshirish."""
    lesson = get_object_or_404(Lesson, pk=pk)
    lesson.views_count += 1
    lesson.save(update_fields=["views_count"])
    if lesson.course:
        lesson.course.views_count += 1
        lesson.course.save(update_fields=["views_count"])
    return Response({"detail": "View count updated", "views_count": lesson.views_count})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_course(request, pk):
    """Kursga a'zo bo'lish (enroll)."""
    course = get_object_or_404(Course, pk=pk)

    if course.is_private and course.instructor != request.user:
        access_code = request.data.get("access_code", "").strip()
        if access_code != course.access_code:
            return Response({"detail": "Noto'g'ri maxfiy ulash kodi."}, status=400)

    enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
    return Response({"detail": "Kursga muvaffaqiyatli a'zo bo'lindi!", "enrolled": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def access_private_course(request, pk):
    """Maxfiy kursga access_code orqali kiring."""
    course = get_object_or_404(Course, pk=pk)
    code = request.data.get("access_code", "").strip()

    if not course.is_private:
        return Response({"detail": "Bu ochiq kurs."})

    if course.access_code == code:
        Enrollment.objects.get_or_create(user=request.user, course=course)
        return Response({"detail": "Maxfiy kursga kirish muvaffaqiyatli!", "has_access": True})

    return Response({"detail": "Noto'g'ri maxfiy kod!"}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_courses(request):
    """Foydalanuvchi yaratgan va a'zo bo'lgan kurslari."""
    user = request.user
    created = Course.objects.filter(instructor=user)
    enrolled_ids = Enrollment.objects.filter(user=user).values_list("course_id", flat=True)
    enrolled = Course.objects.filter(id__in=enrolled_ids)

    return Response({
        "created": CourseListSerializer(created, many=True, context={"request": request}).data,
        "enrolled": CourseListSerializer(enrolled, many=True, context={"request": request}).data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_lesson(request, course_id):
    """Kursga yangi video dars qo'shish."""
    course = get_object_or_404(Course, pk=course_id)
    if course.instructor != request.user and not request.user.is_staff:
        return Response({"detail": "Ruxsat yo'q. Faqat muallif dars qo'sha oladi."}, status=403)

    title = request.data.get("title", "").strip()
    youtube_url = request.data.get("youtube_url", "").strip()
    duration = request.data.get("duration", "").strip()
    is_preview = bool(request.data.get("is_preview", False))

    if not title or not youtube_url:
        return Response({"detail": "Title va youtube_url talab qilinadi."}, status=400)

    next_order = course.lessons.count() + 1
    lesson = Lesson.objects.create(
        course=course,
        title=title,
        youtube_url=youtube_url,
        duration=duration,
        order=next_order,
        is_preview=is_preview,
    )
    return Response(LessonSerializer(lesson).data, status=status.HTTP_201_CREATED)
