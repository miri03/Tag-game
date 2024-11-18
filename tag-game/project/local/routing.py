from django.urls import re_path
from . import consumers  # Import your WebSocket consumer

websocket_urlpatterns = [
    re_path(r'ws/tag-game/', consumers.MyConsumer.as_asgi()),
]
