from student.models import Notification
from hostel_owner.models import OwnerNotification

def send_community_notification(user, message):
    if user.role == 'Student':
        Notification.objects.create(user=user, message=message)
    elif user.role == 'HostelOwner':
        OwnerNotification.objects.create(user=user, message=message)



