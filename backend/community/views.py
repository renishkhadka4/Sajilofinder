from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action

from .models import Post, Like, Comment, CommentLike
from .serializers import PostSerializer, CommentSerializer
from .utils import send_community_notification


# Post Management
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')  # Fetch posts ordered by newest first
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Allow only Students or HostelOwners to create posts
        print("DEBUG:", self.request.data)
        print("User role:", self.request.user.role)
        if self.request.user.role not in ['Student', 'HostelOwner']:
            raise PermissionDenied("Only students or hostel owners can post.")

        serializer.save(author=self.request.user)  # Set the author automatically

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        # Like or unlike a post
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            like.delete()  # Unlike if already liked
            return Response({'liked': False})
        
        # Send notification if not liking own post
        if post.author != request.user:
            message = f"{request.user.username} liked your post."
            send_community_notification(post.author, message)
        
        return Response({'liked': True})

# Comment Management
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()  # Fetch all comments
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        # Allow only Students or HostelOwners to comment
        if user.role not in ['Student', 'HostelOwner']:
            raise PermissionDenied("Only students or hostel owners can comment.")

        comment = serializer.save(user=user)  # Set the comment's user

        # Top-level comment notification (comment directly on post)
        if comment.parent is None and comment.post.author != user:
            message = f"{user.username} commented on your post."
            send_community_notification(comment.post.author, message)

        # Reply to another comment notification
        elif comment.parent and comment.parent.user != user:
            message = f"{user.username} replied to your comment."
            send_community_notification(comment.parent.user, message)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        # Like or unlike a comment
        comment = self.get_object()
        like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)

        if not created:
            like.delete()  # Unlike if already liked
            return Response({'liked': False})

        # Notify comment author if liked by someone else
        if comment.user != request.user:
            message = f"{request.user.username} liked your comment."
            send_community_notification(comment.user, message)

        return Response({'liked': True})
