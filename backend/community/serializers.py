from rest_framework import serializers
from .models import Post, Like, Comment, CommentLike
from api.serializers import UserProfileSerializer  # Assuming you already have this

class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'parent', 'created_at', 'replies', 'liked_by_user']
        #                👆 changed from 'content' to 'text'

    def get_replies(self, obj):
        replies = obj.replies.all().order_by("created_at")
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        return obj.likes.filter(user=user).exists()



from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'caption', 'image', 'hashtags', 'hostel', 'created_at', 'author_name', 'likes_count']
        read_only_fields = ['author_name', 'likes_count']


    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username



