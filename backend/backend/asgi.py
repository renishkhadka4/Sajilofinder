import os
import django

# ✅ Load Django settings before importing ASGI application
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()  # ✅ Ensure Django apps are loaded before ASGI starts

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from hostel_owner.consumers import ChatConsumer  # ✅ Fixed Import Path

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        path("ws/chat/<int:hostel_id>/", ChatConsumer.as_asgi()),  # ✅ WebSocket Endpoint
    ]),
})
