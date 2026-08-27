from rest_framework import serializers
from .models import Category, Course, Lesson, Enrollment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class LessonSerializer(serializers.ModelSerializer):
    youtube_video_id = serializers.ReadOnlyField()
    course_title = serializers.CharField(source="course.title", read_only=True, default="")

    class Meta:
        model = Lesson
        fields = ("id", "title", "youtube_url", "youtube_video_id", "duration", "order", "is_preview", "views_count", "course_title")


class CourseListSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")
    lessons_count = serializers.IntegerField(source="lessons.count", read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "cover_image",
            "price",
            "is_private",
            "level",
            "views_count",
            "instructor_name",
            "category_name",
            "lessons_count",
            "is_enrolled",
            "created_at",
        )

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if obj.instructor == request.user:
                return True
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "cover_image",
            "price",
            "is_private",
            "access_code",
            "level",
            "views_count",
            "instructor",
            "instructor_name",
            "category_name",
            "lessons",
            "is_enrolled",
            "has_access",
            "created_at",
        )

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if obj.instructor == request.user:
                return True
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_has_access(self, obj):
        request = self.context.get("request")
        if not obj.is_private and float(obj.price) == 0:
            return True
        if request and request.user.is_authenticated:
            if obj.instructor == request.user or request.user.is_staff:
                return True
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False


class CreateCourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, required=False)

    class Meta:
        model = Course
        fields = ("id", "title", "description", "category", "cover_image", "price", "is_private", "level", "lessons")

    def create(self, validated_data):
        lessons_data = validated_data.pop("lessons", [])
        request = self.context.get("request")
        instructor = validated_data.pop("instructor", None) or (request.user if request else None)
        course = Course.objects.create(instructor=instructor, **validated_data)

        for idx, lesson_data in enumerate(lessons_data, start=1):
            Lesson.objects.create(course=course, order=idx, **lesson_data)

        return course
