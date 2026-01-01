from typing import Literal, Optional
from .server import broadcast_message
from pydantic import BaseModel
import asyncio

LayoutMode = Literal["standard", "chat_only", "artifact_right", "split"]

class LayoutUpdate(BaseModel):
    type: Literal["layout_update"] = "layout_update"
    mode: LayoutMode
    sidebar_visible: bool = True

class Layout:
    def __init__(self):
        self._mode: LayoutMode = "standard"
        self._sidebar_visible: bool = True

    @property
    def mode(self) -> LayoutMode:
        return self._mode

    @mode.setter
    def mode(self, value: LayoutMode):
        self._mode = value
        self._safe_send_update()

    @property
    def sidebar_visible(self) -> bool:
        return self._sidebar_visible

    @sidebar_visible.setter
    def sidebar_visible(self, value: bool):
        self._sidebar_visible = value
        self._safe_send_update()

    def set_mode(self, mode: LayoutMode):
        self.mode = mode

    def _safe_send_update(self):
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                loop.create_task(self.send_update())
        except RuntimeError:
            # No running loop (e.g. top-level script execution)
            pass

    async def send_update(self):
        update = self.get_update_message()
        await broadcast_message(update)

    def get_update_message(self) -> LayoutUpdate:
        return LayoutUpdate(
            mode=self._mode,
            sidebar_visible=self._sidebar_visible
        )
