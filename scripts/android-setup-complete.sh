#!/bin/bash

# Complete Android Setup Verification
# This script verifies that everything is ready for Android deployment

echo "✅ Android Setup Verification for BeRun"
echo "======================================="

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

echo "📋 Checking Android setup..."
echo ""

# Check if android directory exists
if [ ! -d "android" ]; then
    echo "❌ Android project not found!"
    echo "   Run: npx cap add android"
    exit 1
fi
echo "✅ Android project exists"

# Check capacitor android plugin
if [ ! -f "android/app/build.gradle" ]; then
    echo "❌ Android build.gradle not found!"
    exit 1
fi
echo "✅ Android build configuration exists"

# Check icons
ICON_DIRS=("mipmap-mdpi" "mipmap-hdpi" "mipmap-xhdpi" "mipmap-xxhdpi" "mipmap-xxxhdpi")
MISSING_ICONS=false

for dir in "${ICON_DIRS[@]}"; do
    if [ ! -f "android/app/src/main/res/$dir/ic_launcher.png" ]; then
        echo "❌ Missing icon: $dir/ic_launcher.png"
        MISSING_ICONS=true
    fi
done

if [ "$MISSING_ICONS" = true ]; then
    echo "🔧 Run: ./scripts/generate-android-icons.sh"
    exit 1
fi
echo "✅ All Android icons generated"

# Check permissions in AndroidManifest.xml
REQUIRED_PERMISSIONS=(
    "android.permission.INTERNET"
    "android.permission.ACCESS_FINE_LOCATION"
    "android.permission.ACCESS_COARSE_LOCATION"
    "android.permission.ACCESS_BACKGROUND_LOCATION"
)

MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"
if [ ! -f "$MANIFEST_FILE" ]; then
    echo "❌ AndroidManifest.xml not found!"
    exit 1
fi

MISSING_PERMISSIONS=false
for permission in "${REQUIRED_PERMISSIONS[@]}"; do
    if ! grep -q "$permission" "$MANIFEST_FILE"; then
        echo "❌ Missing permission: $permission"
        MISSING_PERMISSIONS=true
    fi
done

if [ "$MISSING_PERMISSIONS" = true ]; then
    echo "🔧 Add missing permissions to AndroidManifest.xml"
    exit 1
fi
echo "✅ All required permissions configured"

# Check build.gradle configuration
BUILD_GRADLE="android/app/build.gradle"
if ! grep -q "signingConfigs" "$BUILD_GRADLE"; then
    echo "❌ Signing configuration not found in build.gradle"
    exit 1
fi
echo "✅ Signing configuration present"

# Check if keystore example exists
if [ ! -f "android/app/keystore.properties.example" ]; then
    echo "❌ keystore.properties.example not found"
    exit 1
fi
echo "✅ Keystore configuration template exists"

# Check .gitignore
GITIGNORE_ENTRIES=(
    "android/app/*.keystore"
    "android/app/keystore.properties"
)

GITIGNORE_FILE=".gitignore"
if [ ! -f "$GITIGNORE_FILE" ]; then
    echo "⚠️  .gitignore not found - creating..."
    touch .gitignore
fi

MISSING_GITIGNORE=false
for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if ! grep -q "$entry" "$GITIGNORE_FILE"; then
        echo "⚠️  Adding to .gitignore: $entry"
        echo "$entry" >> .gitignore
        MISSING_GITIGNORE=true
    fi
done

if [ "$MISSING_GITIGNORE" = false ]; then
    echo "✅ .gitignore properly configured"
fi

# Check package.json scripts
PACKAGE_JSON="package.json"
if ! grep -q "cap:android" "$PACKAGE_JSON"; then
    echo "❌ Android scripts not found in package.json"
    exit 1
fi
echo "✅ NPM scripts configured"

echo ""
echo "🎉 Android Setup Complete!"
echo "=========================="
echo ""
echo "📱 Your BeRun Android app is ready for:"
echo "   ✅ Development testing"
echo "   ✅ Production builds"
echo "   ✅ Google Play Store deployment"
echo ""
echo "🚀 Next steps:"
echo "   1. Generate keystore: ./scripts/generate-keystore.sh"
echo "   2. Build release AAB: ./scripts/build-release.sh"
echo "   3. Upload to Google Play Console"
echo ""
echo "📋 Available commands:"
echo "   npm run cap:android           # Run on emulator/device"
echo "   npm run cap:sync:android      # Sync changes"
echo "   npm run cap:build:android     # Build and sync"
echo ""
echo "🔐 Security reminders:"
echo "   - NEVER commit keystore files to git"
echo "   - BACKUP your keystore securely"
echo "   - Keep keystore passwords safe"
echo ""
echo "✨ BeRun Android is ready to go!"
