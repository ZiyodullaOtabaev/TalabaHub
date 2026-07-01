from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Article, Comment, Reaction
from .serializers import (
    ArticleDetailSerializer,
    ArticleSerializer,
    CommentSerializer,
)


class ArticleViewSet(viewsets.ModelViewSet):
    """Maqolalar: hamma o'qiy oladi, faqat muallif tahrir/o'chira oladi."""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Article.objects.select_related("author").all()
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def _check_owner(self, instance):
        return instance.author_id == self.request.user.id

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self._check_owner(instance):
            return Response(
                {"detail": "Faqat muallif o'zgartira oladi."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not self._check_owner(instance):
            return Response(
                {"detail": "Faqat muallif o'chira oladi."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ko'rishlar sonini oshirish.
        Article.objects.filter(pk=instance.pk).update(
            views_count=instance.views_count + 1
        )
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def react(self, request, pk=None):
        """Reaksiya qo'shish yoki olib tashlash (toggle)."""
        article = self.get_object()
        reaction, created = Reaction.objects.get_or_create(
            article=article, user=request.user
        )
        if not created:
            reaction.delete()
            reacted = False
        else:
            reacted = True
        return Response(
            {"reacted": reacted, "reactions_count": article.reactions.count()}
        )

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        """Maqola izohlari: GET ro'yxat, POST yangi izoh."""
        article = self.get_object()
        if request.method == "POST":
            serializer = CommentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(article=article, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        qs = article.comments.select_related("author").all()
        return Response(CommentSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def recommended(self, request):
        """Eng ko'p reaksiya va ko'rishlar bo'yicha top tavsiya."""
        qs = (
            Article.objects.select_related("author")
            .annotate(rc=Count("reactions", distinct=True))
            .order_by("-rc", "-views_count", "-created_at")[:10]
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
