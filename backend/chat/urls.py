from django.urls import path

from .views import MessageDelete, MessageListCreate, RoomListCreate

urlpatterns = [
    path("messages/", MessageListCreate.as_view(), name="chat-messages"),
    path("messages/<int:pk>/", MessageDelete.as_view(), name="chat-message-delete"),
    path("rooms/", RoomListCreate.as_view(), name="chat-rooms"),
]
