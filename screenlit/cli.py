import argparse
import os
import sys
import runpy
import uvicorn

def main():
    parser = argparse.ArgumentParser(description="Run a Screenlit application.")
    parser.add_argument("file", help="The Python script to run (e.g., app.py)")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")

    args = parser.parse_args()

    filepath = os.path.abspath(args.file)
    dirname = os.path.dirname(filepath)

    # Ensure the script's directory is in sys.path so imports work
    sys.path.insert(0, dirname)

    # Set environment variable so sl.run() in the script doesn't block
    os.environ["SCREENLIT_CLI"] = "1"

    try:
        # execute the user script to register callbacks
        runpy.run_path(filepath)
    except Exception as e:
        print(f"Error loading application: {e}")
        sys.exit(1)

    # Start the server
    print(f"Starting Screenlit app from {args.file}...")
    uvicorn.run("screenlit:app", host=args.host, port=args.port, reload=args.reload)

if __name__ == "__main__":
    main()
