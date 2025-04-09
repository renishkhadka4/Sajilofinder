import json
from channels.generic.websocket import AsyncWebsocketConsumer
from hostel_owner.models import ChatMessage, Hostel, OwnerNotification
from student.models import Notification as StudentNotification
from api.models import CustomUser
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.hostel_id = self.scope["url_route"]["kwargs"]["hostel_id"]
        self.room_group_name = f"chat_{self.hostel_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id")
        message = data.get("message", "")
        image_url = data.get("image_url", None)

        sender = await self.get_user(sender_id)
        receiver = await self.get_user(receiver_id)

        if not sender or not receiver:
            return await self.send_error("Invalid sender or receiver.")

        # Save the chat message
        chat_message = await self.save_message(sender, receiver, message, image_url)

        if not chat_message:
            return await self.send_error("Could not save message.")

        # Send notification to the receiver
        await self.send_notification(receiver, f"New message from {sender.username}")

        # Send the message to both the sender and receiver WebSocket
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "sender": sender.username,
                "receiver": receiver.username,
                "message": message,
                "image_url": image_url,
                "timestamp": chat_message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

    async def chat_message(self, event):
        # Send the message data back to WebSocket clients (both sender and receiver)
        await self.send(text_data=json.dumps({
            "sender": event["sender"],
            "receiver": event["receiver"],
            "message": event["message"],
            "image_url": event.get("image_url"),
            "timestamp": event["timestamp"],
        }))


    @sync_to_async
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, sender, receiver, message, image_url=None):
        try:
            hostel = Hostel.objects.get(id=self.hostel_id)
            return ChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                hostel=hostel,
                message=message,
                image=image_url
            )
        except ObjectDoesNotExist:
            return None

    @sync_to_async
    def send_notification(self, user, message):
        """ Create notification for user (student or hostel owner) """
        if user.role == "HostelOwner":
            OwnerNotification.objects.create(user=user, message=message)
        elif user.role == "Student":
            StudentNotification.objects.create(user=user, message=message)

    async def send_error(self, error_message):
        # Send error message to the WebSocket client
        await self.send(text_data=json.dumps({"error": error_message}))
