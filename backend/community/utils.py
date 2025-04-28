from student.models import Notification
from hostel_owner.models import OwnerNotification

# Send notification to user based on their role
def send_community_notification(user, message):
    if user.role == 'Student':
        # Create a notification for Student
        Notification.objects.create(user=user, message=message)
    elif user.role == 'HostelOwner':
        # Create a notification for Hostel Owner
        OwnerNotification.objects.create(user=user, message=message)
