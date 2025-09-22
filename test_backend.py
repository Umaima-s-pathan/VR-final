#!/usr/bin/env python3
"""
Test script to verify backend functionality
"""
import requests
import time
import sys

def test_backend():
    backend_url = "https://vr-final.onrender.com"

    print("🧪 Testing Palace VR180 Backend")
    print(f"Backend URL: {backend_url}")
    print("-" * 50)

    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{backend_url}/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")

    print()

    # Test 2: Root endpoint
    print("2. Testing root endpoint...")
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        if response.status_code == 200:
            print("✅ Root endpoint accessible")
            if "deploying" in response.text.lower():
                print("⚠️  Backend is still deploying")
            else:
                print("✅ Backend appears to be running")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")

    print()

    # Test 3: CORS headers
    print("3. Testing CORS configuration...")
    try:
        response = requests.options(f"{backend_url}/api/upload", timeout=10)
        if response.status_code == 200:
            print("✅ CORS preflight passed")
        else:
            print(f"⚠️  CORS preflight: {response.status_code}")
    except Exception as e:
        print(f"❌ CORS test error: {e}")

    print()
    print("📊 Summary:")
    print("- Health endpoint: Check if backend is responding")
    print("- Root endpoint: Check if main page loads")
    print("- CORS: Check if frontend can communicate with backend")
    print()
    print("💡 If tests fail, the backend might still be deploying.")
    print("   Wait 5-10 minutes and try again.")

if __name__ == "__main__":
    test_backend()
