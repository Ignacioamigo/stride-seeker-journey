#!/bin/bash

# Generate Android App Icons for BeRun
# This script generates all required Android icon sizes from the main icon

echo "🎨 Generando iconos de Android para BeRun"
echo "========================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick no está instalado."
    echo "📦 Para instalar ImageMagick:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Descargar desde https://imagemagick.org/script/download.php"
    exit 1
fi

# Source icon
SOURCE_ICON="../public/BeRun_appicon_1024_blue1463FF.png"
ANDROID_RES_DIR="../android/app/src/main/res"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ No se encontró el icono fuente: $SOURCE_ICON"
    exit 1
fi

echo "📱 Usando icono fuente: $SOURCE_ICON"
echo ""

# Create directories if they don't exist
mkdir -p "$ANDROID_RES_DIR/mipmap-mdpi"
mkdir -p "$ANDROID_RES_DIR/mipmap-hdpi"
mkdir -p "$ANDROID_RES_DIR/mipmap-xhdpi"
mkdir -p "$ANDROID_RES_DIR/mipmap-xxhdpi"
mkdir -p "$ANDROID_RES_DIR/mipmap-xxxhdpi"

# Generate icon sizes
echo "🔧 Generando iconos en diferentes resoluciones..."

# mdpi: 48x48
echo "   📐 Generando mdpi (48x48)..."
convert "$SOURCE_ICON" -resize 48x48 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher.png"
convert "$SOURCE_ICON" -resize 48x48 "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_round.png"

# hdpi: 72x72
echo "   📐 Generando hdpi (72x72)..."
convert "$SOURCE_ICON" -resize 72x72 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher.png"
convert "$SOURCE_ICON" -resize 72x72 "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_round.png"

# xhdpi: 96x96
echo "   📐 Generando xhdpi (96x96)..."
convert "$SOURCE_ICON" -resize 96x96 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher.png"
convert "$SOURCE_ICON" -resize 96x96 "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_round.png"

# xxhdpi: 144x144
echo "   📐 Generando xxhdpi (144x144)..."
convert "$SOURCE_ICON" -resize 144x144 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher.png"
convert "$SOURCE_ICON" -resize 144x144 "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_round.png"

# xxxhdpi: 192x192
echo "   📐 Generando xxxhdpi (192x192)..."
convert "$SOURCE_ICON" -resize 192x192 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher.png"
convert "$SOURCE_ICON" -resize 192x192 "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png"

# Generate foreground icons (for adaptive icons)
echo ""
echo "🎯 Generando iconos foreground para iconos adaptativos..."

# Generate foreground versions (slightly smaller for padding)
convert "$SOURCE_ICON" -resize 40x40 -gravity center -extent 48x48 -transparent white "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 60x60 -gravity center -extent 72x72 -transparent white "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 80x80 -gravity center -extent 96x96 -transparent white "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 120x120 -gravity center -extent 144x144 -transparent white "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 160x160 -gravity center -extent 192x192 -transparent white "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png"

echo ""
echo "✅ ¡Iconos generados exitosamente!"
echo ""
echo "📋 Iconos creados:"
echo "   ├── mipmap-mdpi/ (48x48)"
echo "   ├── mipmap-hdpi/ (72x72)"
echo "   ├── mipmap-xhdpi/ (96x96)"
echo "   ├── mipmap-xxhdpi/ (144x144)"
echo "   └── mipmap-xxxhdpi/ (192x192)"
echo ""
echo "🎨 Cada carpeta contiene:"
echo "   ├── ic_launcher.png (icono principal)"
echo "   ├── ic_launcher_round.png (icono redondo)"
echo "   └── ic_launcher_foreground.png (para iconos adaptativos)"
echo ""
echo "🔄 Sincroniza la app para aplicar los cambios:"
echo "   npm run cap:sync:android"
