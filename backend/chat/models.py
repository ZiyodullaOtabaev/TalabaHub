from django.conf import settings
from django.db import models


class Room(models.Model):
    """Mavzu/guruh xonasi. room=null bo'lsa — umumiy chat."""

    name = models.CharField(max_length=120, unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_rooms",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Message(models.Model):
    """Chat xabari — barcha talabalar ko'radi."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="messages",
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user}: {self.text[:30]}"


class MessageRead(models.Model):
    """Kim qaysi xabarni o'qiganini kuzatish (Telegram guruhdagi ko'rganlar kabi)."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reads",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="read_messages",
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")
        ordering = ["-read_at"]

    def __str__(self):
        return f"{self.user.username} read msg#{self.message_id}"
