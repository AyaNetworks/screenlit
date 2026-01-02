from typing import Literal, Optional, List, Dict, Any
from .server import broadcast_message
from pydantic import BaseModel
import asyncio

ArtifactType = Literal["markdown", "html", "code", "text"]

class Artifact(BaseModel):
    id: str
    title: str
    content: str
    type: ArtifactType

class ArtifactUpdate(BaseModel):
    type: Literal["artifact_update"] = "artifact_update"
    action: Literal["create", "update", "delete"]
    artifact: Artifact

class Artifacts:
    def __init__(self):
        self._artifacts: Dict[str, Artifact] = {}

    def create(self, content: str, title: str = "New Artifact", type: ArtifactType = "markdown", id: Optional[str] = None):
        if id is None:
            import uuid
            id = str(uuid.uuid4())

        artifact = Artifact(id=id, title=title, content=content, type=type)
        self._artifacts[id] = artifact
        self._safe_send_update("create", artifact)
        return artifact

    def update(self, id: str, content: str):
        if id in self._artifacts:
            self._artifacts[id].content = content
            self._safe_send_update("update", self._artifacts[id])

    def _safe_send_update(self, action: str, artifact: Artifact):
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                loop.create_task(self._send_update(action, artifact))
        except RuntimeError:
            # No running loop
            pass

    async def _send_update(self, action: str, artifact: Artifact):
        update = ArtifactUpdate(
            action=action,
            artifact=artifact
        )
        await broadcast_message(update)

    def get_all_artifacts_updates(self) -> List[ArtifactUpdate]:
        updates = []
        for artifact in self._artifacts.values():
            updates.append(ArtifactUpdate(
                action="create",
                artifact=artifact
            ))
        return updates
