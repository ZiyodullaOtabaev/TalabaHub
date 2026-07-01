from rest_framework import serializers

from .models import Article, Comment


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = ("id", "article", "author_username", "content", "created_at")
        read_only_fields = ("author_username", "created_at")
        extra_kwargs = {"article": {"required": False}}


class ArticleSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    reactions_count = serializers.IntegerField(source="reactions.count", read_only=True)
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)
    reacted = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "content",
            "author_username",
            "views_count",
            "reactions_count",
            "comments_count",
            "reacted",
            "created_at",
        )
        read_only_fields = (
            "author_username",
            "views_count",
            "reactions_count",
            "comments_count",
            "reacted",
            "created_at",
        )

    def get_reacted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.reactions.filter(user=request.user).exists()


class ArticleDetailSerializer(ArticleSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta(ArticleSerializer.Meta):
        fields = ArticleSerializer.Meta.fields + ("comments",)
