# Screenlit SDK Reference

Screenlit is an 'Artifact-First' AI framework designed to create persistent, artifact-centric applications. This reference documents the Python SDK.

## Core Concepts

Screenlit apps are built by defining a callback for chat messages using the `@sl.on_chat_message` decorator. The application state is persistent and managed via a backend server.

### Application Structure

#### `sl.run(host="0.0.0.0", port=8000)`
Starts the Screenlit application server.
- **Usage**: Typically called at the end of your script.
- **CLI**: You can also run your app using `screenlit run app.py`, which overrides this call.

#### `@sl.on_chat_message`
Decorator to register an async function that handles incoming user messages.
- **Callback Signature**: `async def func(msg: Message)`
- **Message Object**: Has `content` (str) and `role` (str).

Example:
```python
import screenlit as sl

@sl.on_chat_message
async def handle_message(msg):
    # Your logic here
    await sl.send_message(f"Echo: {msg.content}")
```

#### `sl.send_message(content: str, role: str = "ai")`
Sends a chat message to the frontend.
- `content`: The text content of the message.
- `role`: The role of the sender ("ai" or "user"). Defaults to "ai".

## Layout Management

Control the application layout using `sl.layout`.

#### `sl.layout.mode`
Property to get or set the current layout mode.
- **Values**: `"standard"`, `"chat_only"`, `"artifact_right"`, `"split"`.
- **Default**: `"standard"`.

#### `sl.layout.sidebar_visible`
Property to show or hide the sidebar.
- **Values**: `True`, `False`.
- **Default**: `True`.

Example:
```python
# Switch to split view
sl.layout.mode = "split"
# Hide sidebar
sl.layout.sidebar_visible = False
```

## Artifacts

Artifacts are persistent content blocks (Markdown, HTML, Code, etc.) displayed in the application.

#### `sl.markdown(content: str, title: str = "Markdown Artifact")`
Creates or updates a Markdown artifact.
- `content`: Markdown string.
- `title`: Title of the artifact tab.

#### `sl.text(content: str, title: str = "Text Artifact")`
Creates a plain text artifact.

#### `sl.html(content: str, title: str = "HTML Artifact")`
Creates an HTML artifact.

#### `sl.code(content: str, title: str = "Code Artifact")`
Creates a code artifact with syntax highlighting.

#### `sl.image(url: str, title: str = "Image Artifact")`
Creates an image artifact.

#### `sl.video(url: str, title: str = "Video Artifact")`
Creates a video artifact.

#### `sl.audio(url: str, title: str = "Audio Artifact")`
Creates an audio artifact.

#### `sl.csv(content: str, title: str = "CSV Artifact")`
Creates a CSV artifact (rendered as a table).

#### `sl.pdf(url: str, title: str = "PDF Artifact")`
Creates a PDF viewer artifact.

### Updating Artifacts

All artifact helper methods return an `Artifact` object. You can update the content of an artifact by calling `sl.artifacts.update(id, content)`.

```python
# Create
my_doc = sl.markdown("# Initial Content", title="My Doc")

# Update later
sl.artifacts.update(my_doc.id, "# Updated Content")
```
