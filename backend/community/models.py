from django.db import models
from django.conf import settings
from hostel_owner.models import Hostel

User = settings.AUTH_USER_MODEL  # Use the custom user model


# Community Post Model
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # Who created the post
    caption = models.TextField(blank=True)  # Optional caption text
    image = models.ImageField(upload_to='community_posts/', blank=True, null=True)  # Optional post image
    hashtags = models.JSONField(blank=True, null=True)  # List of hashtags in JSON format
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, null=True, blank=True)  # Optional linked hostel
    created_at = models.DateTimeField(auto_now_add=True)  # Post creation timestamp

    def __str__(self):
        return f"Post by {self.author.email} - {self.caption[:30]}"


# Like Model for Posts
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who liked
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')  # Liked post
    created_at = models.DateTimeField(auto_now_add=True)  # Like timestamp

    class Meta:
        unique_together = ('user', 'post')  # Ensure a user can like a post only once


# Comment Model (with nested replies)
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who commented
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')  # Commented post
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')  # For reply threading
    text = models.TextField()  # Comment text
    created_at = models.DateTimeField(auto_now_add=True)  # Comment timestamp


# Like Model for Comments
class CommentLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who liked comment
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')  # Liked comment
    created_at = models.DateTimeField(auto_now_add=True)  # Like timestamp

    class Meta:
        unique_together = ('user', 'comment')  # Ensure a user can like a comment only once
