import json
from channels.generic.websocket import AsyncWebsocketConsumer
from hostel_owner.models import ChatMessage
from api.models import CustomUser
from django.core.exceptions import ObjectDoesNotExist
from hostel_owner.models import Hostel
from django.db.models import F
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.hostel_id = self.scope["url_route"]["kwargs"]["hostel_id"]
        self.room_group_name = f"chat_{self.hostel_id}"

        # Join WebSocket Room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave WebSocket Room
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """ Handle incoming WebSocket messages """
        try:
            data = json.loads(text_data)
            sender_id = data.get("sender_id")
            receiver_id = data.get("receiver_id")
            message = data.get("message")

            if not sender_id or not receiver_id or not message:
                await self.send_error("Missing sender_id, receiver_id, or message.")
                return

            sender = await self.get_user(sender_id)
            receiver = await self.get_user(receiver_id)

            if not sender or not receiver:
                await self.send_error("Invalid sender or receiver ID.")
                return

            # Save message in the database
            chat_message = await self.save_message(sender, receiver, message)

            # Send email notification
            send_chat_email_notification(sender, receiver, message)

            # Send message to WebSocket group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "sender": sender.username,
                    "receiver": receiver.username,
                    "message": message,
                    "timestamp": chat_message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format.")

        except CustomUser.DoesNotExist:
            await self.send_error("Invalid sender or receiver ID.")

    async def chat_message(self, event):
        """ Send message to WebSocket """
        await self.send(text_data=json.dumps({
            "sender": event["sender"],
            "receiver": event["receiver"],
            "message": event["message"],
            "timestamp": event["timestamp"],
        }))

    @sync_to_async
    def get_user(self, user_id):
        """ Fetch user asynchronously to avoid blocking """
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, sender, receiver, message):
        """ Save chat message asynchronously, ensuring hostel_id exists """
        try:
            hostel = Hostel.objects.get(id=self.hostel_id)
            return ChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                hostel=hostel,
                message=message
            )
        except ObjectDoesNotExist:
            return None

    @sync_to_async
    def increment_unread_messages(self, receiver):
        """ Increment unread message counter asynchronously """
        receiver.unread_messages = F("unread_messages") + 1
        receiver.save(update_fields=["unread_messages"])

    async def send_error(self, error_message):
        """ Send error message to the WebSocket client """
        await self.send(text_data=json.dumps({"error": error_message}))
