from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Post, Like, Comment, CommentLike
from .serializers import PostSerializer, CommentSerializer

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from .utils import send_community_notification

from .models import Post, Like
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print("DEBUG:", self.request.data)  # 👈 add this
        print("User role:", self.request.user.role)
        if self.request.user.role not in ['Student', 'HostelOwner']:
            raise PermissionDenied("Only students or hostel owners can post.")
        serializer.save(author=self.request.user)


    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'liked': False})
        
        # 🔔 Send notification to the post author if not self-like
        if post.author != request.user:
            message = f"{request.user.username} liked your post."
            send_community_notification(post.author, message)
        
        return Response({'liked': True})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['Student', 'HostelOwner']:
            raise PermissionDenied("Only students or hostel owners can comment.")
        
        comment = serializer.save(user=user)

        # 🔔 Notify the post author if commenting on top-level (not a reply)
        if comment.parent is None and comment.post.author != user:
            message = f"{user.username} commented on your post."
            send_community_notification(comment.post.author, message)

        # 🔔 Notify the parent comment's author if replying
        elif comment.parent and comment.parent.user != user:
            message = f"{user.username} replied to your comment."
            send_community_notification(comment.parent.user, message)


    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
        if not created:
            like.delete()
            return Response({'liked': False})

        # 🔔 Notify comment author
        if comment.user != request.user:
            message = f"{request.user.username} liked your comment."
            send_community_notification(comment.user, message)

        return Response({'liked': True})

