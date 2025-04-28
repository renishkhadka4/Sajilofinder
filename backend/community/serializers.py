from rest_framework import serializers
from .models import Post, Like, Comment, CommentLike
from api.serializers import UserProfileSerializer  
from rest_framework import serializers
from .models import Post


class CommentSerializer(serializers.ModelSerializer):
    #  Nest user profile information inside comment
    user = UserProfileSerializer(read_only=True)
    #  Fetch all child replies recursively
    replies = serializers.SerializerMethodField()
    #  Check if the current user liked this comment
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'parent', 'created_at', 'replies', 'liked_by_user']

    def get_replies(self, obj):
        """
        Recursively get replies for a comment, ordered by creation time.
        """
        replies = obj.replies.all().order_by("created_at")
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_liked_by_user(self, obj):
        """
        Check if the currently authenticated user has liked this comment.
        """
        user = self.context['request'].user
        return obj.likes.filter(user=user).exists()


class PostSerializer(serializers.ModelSerializer):
    #Custom field to return author's full name (fallback to username)
    author_name = serializers.SerializerMethodField()
    # Include author ID separately (read-only)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    # Calculate total likes for a post dynamically
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'caption', 'image', 'hashtags', 'hostel', 'created_at', 'author_name', 'author_id', 'likes_count']
        read_only_fields = ['author_name', 'author_id', 'likes_count']

    def get_author_name(self, obj):
        """
        Return the author's full name if available, otherwise fallback to username.
        """
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username




