import os
import django

# ✅ Load Django settings before importing ASGI application
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()  # ✅ Ensure Django apps are loaded before ASGI starts

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path  # change this

from hostel_owner.consumers import ChatConsumer  # ✅ Fixed Import Path

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
   "websocket": URLRouter([
    re_path(r"ws/chat/(?P<hostel_id>\d+)/$", ChatConsumer.as_asgi()),  # ✅ Regex-based routing
]),

})
