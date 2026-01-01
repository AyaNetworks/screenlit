import asyncio
import screenlit as sl
from screenlit.types import Message

async def main():
    print("Starting test_features.py...")

    # Simulate a user connection (in real usage, the app runs and waits for connections)
    # Here we are just testing the logic of calling the methods.

    print("Testing sl.layout.mode...")
    sl.layout.mode = "chat_only"
    print(f"Layout mode set to: {sl.layout.mode}")

    print("Testing sl.artifacts.create...")
    artifact = sl.artifacts.create(
        title="Test Report",
        content="# This is a test report",
        type="markdown"
    )
    print(f"Artifact created with ID: {artifact.id}")

    print("Testing sl.artifacts.update...")
    sl.artifacts.update(artifact.id, "# Updated Content")
    print("Artifact updated.")

    print("Test Complete. Check backend logs for broadcasted messages if running in context.")

if __name__ == "__main__":
    asyncio.run(main())
