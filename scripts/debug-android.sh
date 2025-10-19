#!/bin/bash

# Debug Android App
# This script helps debug Android app issues

echo "🔍 BeRun Android Debug"
echo "====================="

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

echo "📱 Step 1: Clean and rebuild..."
cd android || exit 1

# Clean build
./gradlew clean

echo "✅ Clean completed!"
echo ""

echo "🔄 Step 2: Rebuilding..."
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

echo "✅ Build completed!"
echo ""

echo "📋 Step 3: Installing debug APK..."
./gradlew installDebug

if [ $? -eq 0 ]; then
    echo "✅ App installed successfully!"
    echo ""
    echo "🚀 Now try launching the app from the device/emulator"
    echo ""
    echo "📊 To see live logs:"
    echo "adb logcat | grep -E '(BeRun|stride.seeker|FATAL|AndroidRuntime)'"
else
    echo "❌ Installation failed!"
    echo ""
    echo "🔧 Try these solutions:"
    echo "1. Make sure emulator/device is connected"
    echo "2. Enable USB debugging on device"
    echo "3. Check if device is authorized: adb devices"
fi
