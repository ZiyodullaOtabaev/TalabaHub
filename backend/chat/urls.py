from django.urls import path

from .views import MessageDelete, MessageListCreate, RoomListCreate, RoomDelete, mark_messages_read, message_readers

urlpatterns = [
    path("messages/", MessageListCreate.as_view(), name="chat-messages"),
    path("messages/<int:pk>/", MessageDelete.as_view(), name="chat-message-delete"),
    path("messages/<int:pk>/readers/", message_readers, name="chat-message-readers"),
    path("messages/mark-read/", mark_messages_read, name="chat-mark-read"),
    path("rooms/", RoomListCreate.as_view(), name="chat-rooms"),
    path("rooms/<int:pk>/", RoomDelete.as_view(), name="chat-room-delete"),
]
