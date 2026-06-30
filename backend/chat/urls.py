from django.urls import path

from .views import MessageListCreate, RoomListCreate

urlpatterns = [
    path("messages/", MessageListCreate.as_view(), name="chat-messages"),
    path("rooms/", RoomListCreate.as_view(), name="chat-rooms"),
]
