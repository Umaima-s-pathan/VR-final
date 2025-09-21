#!/usr/bin/env python3
"""
Test script to verify deployment setup
"""
import requests
import json
import sys
from datetime import datetime

def test_backend_connection(backend_url):
    """Test backend API connection"""
    print(f"🧪 Testing backend connection to: {backend_url}")

    try:
        # Test basic connectivity
        response = requests.get(f"{backend_url}/", timeout=10)
        print(f"✅ Backend is reachable (Status: {response.status_code})")

        # Test API endpoint
        response = requests.get(f"{backend_url}/api/status/test", timeout=10)
        if response.status_code == 200:
            print("✅ API endpoint is working")
        else:
            print(f"⚠️  API endpoint returned status: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return False

    return True

def test_frontend_build():
    """Test if frontend build exists"""
    print("🧪 Testing frontend build...")

    try:
        import os
        if os.path.exists("dist/index.html"):
            print("✅ Frontend build found (dist/index.html)")
            return True
        else:
            print("❌ Frontend build not found. Run 'npm run build' first")
            return False
    except Exception as e:
        print(f"❌ Error checking frontend build: {e}")
        return False

def main():
    print("🚀 Palace VR180 Platform - Deployment Test")
    print("=" * 50)

    # Test frontend build
    frontend_ok = test_frontend_build()

    # Test backend connection
    backend_url = "http://localhost:3001"  # Default for local testing
    backend_ok = test_backend_connection(backend_url)

    print("\n" + "=" * 50)
    print("📊 Test Results:")

    if frontend_ok and backend_ok:
        print("✅ All tests passed! Ready for deployment.")
        print("\nNext steps:")
        print("1. Push code to GitHub")
        print("2. Deploy backend to Railway/Render/Heroku")
        print("3. Update URLs in streamlit_app.py")
        print("4. Run Streamlit launcher")
    else:
        print("❌ Some tests failed. Please fix issues before deployment.")
        if not frontend_ok:
            print("   - Run 'npm run build' to build frontend")
        if not backend_ok:
            print("   - Start backend server: 'npm run dev:server'")

    print("\n📖 See DEPLOYMENT_GUIDE.md for detailed instructions")

if __name__ == "__main__":
    main()
