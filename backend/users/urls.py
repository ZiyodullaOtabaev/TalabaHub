from django.urls import path

from .views import (
    AdminUserListView,
    ProfileView,
    RegisterView,
    set_admin,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", ProfileView.as_view(), name="me"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/set-admin/", set_admin, name="set-admin"),
]
