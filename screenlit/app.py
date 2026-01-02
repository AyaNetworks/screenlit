import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .server import router, set_message_handler, broadcast_message, set_connection_handler
from .types import Message
from .layout import Layout
from .artifacts import Artifacts
from typing import Callable
import asyncio

class ScreenlitApp:
    def __init__(self):
        self.app = FastAPI()
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self.app.include_router(router)
        self.layout = Layout()
        self.artifacts = Artifacts()
        
        # Register connection handler to sync state
        set_connection_handler(self._handle_connection)

    async def _handle_connection(self):
        # Return list of messages to send on new connection
        messages = []
        messages.append(self.layout.get_update_message())
        messages.extend(self.artifacts.get_all_artifacts_updates())
        return messages

    def on_chat_message(self, func: Callable):
        set_message_handler(func)
        return func
        
    async def send_message(self, content: str, role: str = "ai"):
        msg = Message(role=role, content=content)
        await broadcast_message(msg)

    def set_header(self, title: str, subtitle: str):
        """Sets the application header title and subtitle."""
        self.layout.set_header(title, subtitle)

    async def think(self, content: str):
        """Sends a 'thinking' message to the frontend."""
        msg = Message(role="ai", content=content, type="thought")
        await broadcast_message(msg)

    def run(self, host="0.0.0.0", port=8000):
        # Check if running via CLI to avoid double execution
        import os
        if os.environ.get("SCREENLIT_CLI"):
            return

        # We need to run uvicorn. 
        # Since this is a library, users call `sl.run()`.
        uvicorn.run(self.app, host=host, port=port)
