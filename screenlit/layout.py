from typing import Literal, Optional
from .server import broadcast_message
from pydantic import BaseModel
import asyncio

LayoutMode = Literal["standard", "chat_only", "artifact_right", "split"]

class LayoutUpdate(BaseModel):
    type: Literal["layout_update"] = "layout_update"
    mode: LayoutMode
    sidebar_visible: bool = True
    header_title: str = "Dione Workspaces"
    header_subtitle: str = "An AI driven operational platform by Eisuke Izawa."

class Layout:
    def __init__(self):
        self._mode: LayoutMode = "standard"
        self._sidebar_visible: bool = True
        self._header_title: str = "Dione Workspaces"
        self._header_subtitle: str = "An AI driven operational platform by Eisuke Izawa."

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

    @property
    def header_title(self) -> str:
        return self._header_title

    @header_title.setter
    def header_title(self, value: str):
        self._header_title = value
        self._safe_send_update()

    @property
    def header_subtitle(self) -> str:
        return self._header_subtitle

    @header_subtitle.setter
    def header_subtitle(self, value: str):
        self._header_subtitle = value
        self._safe_send_update()

    def set_mode(self, mode: LayoutMode):
        self.mode = mode

    def set_header(self, title: str, subtitle: str):
        self._header_title = title
        self._header_subtitle = subtitle
        self._safe_send_update()

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
            sidebar_visible=self._sidebar_visible,
            header_title=self._header_title,
            header_subtitle=self._header_subtitle
        )
