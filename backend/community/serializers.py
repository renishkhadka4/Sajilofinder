from rest_framework import serializers
from .models import Post, Like, Comment, CommentLike
from api.serializers import UserProfileSerializer


# Comment Serializer (with nested replies)
class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)  # Nested user profile inside comment
    replies = serializers.SerializerMethodField()  # Get all child replies
    liked_by_user = serializers.SerializerMethodField()  # Check if current user liked this comment

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'parent', 'created_at', 'replies', 'liked_by_user']

    def get_replies(self, obj):
        # Recursively fetch replies ordered by creation time
        replies = obj.replies.all().order_by("created_at")
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_liked_by_user(self, obj):
        # Check if the logged-in user liked this comment
        user = self.context['request'].user
        return obj.likes.filter(user=user).exists()

# Post Serializer
class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()  # Get author's full name or fallback to username
    author_id = serializers.IntegerField(source='author.id', read_only=True)  # Author's user ID
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)  # Total likes on the post

    class Meta:
        model = Post
        fields = [
            'id', 'caption', 'image', 'hashtags', 'hostel', 'created_at',
            'author_name', 'author_id', 'likes_count'
        ]
        read_only_fields = ['author_name', 'author_id', 'likes_count']

    def get_author_name(self, obj):
        # Return full name if available, otherwise fallback to username
        full_name = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full_name if full_name else obj.author.username
