#!/usr/bin/env python3
"""
Simple script to run the Streamlit launcher app
"""
import subprocess
import sys

def main():
    print("🚀 Starting Palace VR180 Platform Launcher...")
    print("📱 Streamlit app will open in your browser")
    print("🌐 Make sure to update the backend URL in the sidebar")

    try:
        # Run streamlit
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "streamlit_app.py",
            "--server.port", "8501",
            "--server.address", "0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Error starting Streamlit: {e}")
        print("💡 Make sure you have installed requirements: pip install -r requirements.txt")

if __name__ == "__main__":
    main()
