from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    CourseViewSet,
    enroll_course,
    access_private_course,
    my_courses,
    add_lesson,
    top_viewed_videos,
    increment_lesson_views,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="course-categories")
router.register(r"", CourseViewSet, basename="courses")

urlpatterns = [
    path("top-viewed/", top_viewed_videos, name="top-viewed-videos"),
    path("lessons/<int:pk>/view/", increment_lesson_views, name="increment-lesson-views"),
    path("my-courses/", my_courses, name="my-courses"),
    path("<int:pk>/enroll/", enroll_course, name="course-enroll"),
    path("<int:pk>/access-private/", access_private_course, name="course-access-private"),
    path("<int:course_id>/lessons/", add_lesson, name="course-add-lesson"),
]

urlpatterns += router.urls
