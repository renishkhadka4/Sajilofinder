from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from hostel_owner.models import Booking
from django.conf import settings

class Command(BaseCommand):
    help = "Send booking reminders to students"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        reminders_sent = 0

        # Send reminders for upcoming check-ins (1 day before)
        upcoming_bookings = Booking.objects.filter(check_in=today + timezone.timedelta(days=1), status="confirmed")
        for booking in upcoming_bookings:
            send_mail(
                "Upcoming Check-in Reminder",
                f"Hello {booking.student.username},\n\nYour check-in is scheduled for {booking.check_in}. Please be prepared.\n\nThank you!",
                settings.EMAIL_HOST_USER,
                [booking.student.email],
                fail_silently=False,
            )
            reminders_sent += 1

        # Send reminders for pending bookings that will expire soon (unconfirmed for 3+ days)
        pending_bookings = Booking.objects.filter(status="pending", created_at__lte=timezone.now() - timezone.timedelta(days=3))
        for booking in pending_bookings:
            send_mail(
                "Complete Your Booking",
                f"Hello {booking.student.username},\n\nYour booking request is still pending. Please complete the process before it expires.\n\nThank you!",
                settings.EMAIL_HOST_USER,
                [booking.student.email],
                fail_silently=False,
            )
            reminders_sent += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Sent {reminders_sent} booking reminders"))
