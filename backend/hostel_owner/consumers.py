import json
from channels.generic.websocket import AsyncWebsocketConsumer
from hostel_owner.models import ChatMessage, Hostel
from api.models import CustomUser
from student.models import Notification as StudentNotification
from hostel_owner.models import OwnerNotification
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.hostel_id = self.scope["url_route"]["kwargs"].get("hostel_id", None)
            self.owner_id = self.scope["url_route"]["kwargs"].get("owner_id", None)
            print(f"📩 Incoming WebSocket connect... hostel_id: {self.hostel_id}, owner_id: {self.owner_id}")

            if self.hostel_id:
                self.room_group_name = f"chat_{self.hostel_id}"
            elif self.owner_id:
                self.room_group_name = f"owner_chat_{self.owner_id}"
            else:
                print("❌ No hostel_id or owner_id found in URL.")
                await self.close()
                return

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            print(f"✅ WebSocket connected to {self.room_group_name}")
        except Exception as e:
            print(f"❌ WebSocket exception: {e}")
            await self.close()






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
            return await self.send(text_data=json.dumps({"error": "Invalid sender/receiver"}))

        chat_message = await self.save_message(sender, receiver, message, image_url)
        if not chat_message:
            return await self.send(text_data=json.dumps({"error": "Could not save message"}))

        await self.send_notification(receiver, f"New message from {sender.username}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "sender": sender.username,
                "receiver": receiver.username,
                "message": message,
                "image_url": image_url,
                "timestamp": chat_message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "hostel_id": chat_message.hostel.id,
                "hostel_name": chat_message.hostel.name,
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "sender": event["sender"],
            "receiver": event["receiver"],
            "message": event["message"],
            "image_url": event.get("image_url"),
            "timestamp": event["timestamp"],
            "hostel_id": event["hostel_id"],
            "hostel_name": event["hostel_name"],
        }))

    @sync_to_async
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, sender, receiver, message, image_url):
        try:
            hostel = Hostel.objects.get(id=self.hostel_id or receiver.hostel_owner_set.first().id)
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
        if user.role == "HostelOwner":
            OwnerNotification.objects.create(user=user, message=message)
        elif user.role == "Student":
            StudentNotification.objects.create(user=user, message=message)
