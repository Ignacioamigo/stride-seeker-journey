#!/bin/bash

# Build Release AAB for Google Play Store
# This script builds the final Android App Bundle (AAB) for production

echo "🚀 Building BeRun for Google Play Store Release"
echo "=============================================="

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

echo "📱 Step 1: Building Web Application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

echo "✅ Web build completed!"
echo ""

echo "🔄 Step 2: Syncing with Android..."
npm run cap:sync:android

if [ $? -ne 0 ]; then
    echo "❌ Android sync failed!"
    exit 1
fi

echo "✅ Android sync completed!"
echo ""

echo "🔑 Step 3: Checking keystore configuration..."

# Check if keystore.properties exists
if [ ! -f "android/app/keystore.properties" ]; then
    echo "⚠️  keystore.properties not found!"
    echo ""
    echo "🔧 Please run the keystore generation script first:"
    echo "   ./scripts/generate-keystore.sh"
    echo ""
    echo "Or manually create android/app/keystore.properties with:"
    echo "   BERUN_RELEASE_STORE_FILE=berun-release-key.keystore"
    echo "   BERUN_RELEASE_STORE_PASSWORD=your_store_password"
    echo "   BERUN_RELEASE_KEY_ALIAS=berun-key"
    echo "   BERUN_RELEASE_KEY_PASSWORD=your_key_password"
    exit 1
fi

echo "✅ Keystore configuration found!"
echo ""

echo "📦 Step 4: Building Release AAB..."
cd android || exit 1

# Clean previous builds
echo "   🧹 Cleaning previous builds..."
./gradlew clean

# Build release AAB
echo "   🔨 Building release AAB..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! AAB built successfully!"
    echo ""
    echo "📁 Your release AAB is located at:"
    echo "   $(pwd)/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "📋 Next steps:"
    echo "1. 🔍 Test the AAB on a device or emulator"
    echo "2. 🌐 Upload to Google Play Console"
    echo "3. 📝 Complete the app listing information"
    echo "4. 🚀 Submit for review!"
    echo ""
    echo "💡 File size: $(ls -lh app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')"
    
    # Generate SHA-256 fingerprint for Play Console
    if [ -f "app/keystore.properties" ]; then
        echo ""
        echo "🔐 Generating SHA-256 fingerprint for Play Console..."
        source app/keystore.properties
        keytool -list -v -keystore "app/$BERUN_RELEASE_STORE_FILE" -alias "$BERUN_RELEASE_KEY_ALIAS" -storepass "$BERUN_RELEASE_STORE_PASSWORD" | grep "SHA256:"
    fi
    
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "🔍 Check the error messages above and ensure:"
    echo "1. ✅ Keystore file exists and is valid"
    echo "2. ✅ Keystore passwords are correct"
    echo "3. ✅ All dependencies are installed"
    echo "4. ✅ Android SDK is properly configured"
    exit 1
fi
