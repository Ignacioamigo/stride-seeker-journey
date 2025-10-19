#!/bin/bash

# Script rápido para generar AAB cuando el keystore ya está configurado
# Para primera vez, usa: generate-release-aab.sh

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
KEYSTORE_PROPS="$ANDROID_DIR/app/keystore.properties"

echo -e "${BLUE}🚀 BeRun - Quick AAB Generator${NC}"
echo ""

# Verificar keystore
if [ ! -f "$KEYSTORE_PROPS" ]; then
    echo -e "${RED}❌ keystore.properties no encontrado${NC}"
    echo -e "${YELLOW}Ejecuta primero: ./scripts/generate-release-aab.sh${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# Build web
echo -e "${YELLOW}[1/3]${NC} Building web..."
npm run build

# Sync Capacitor
echo -e "${YELLOW}[2/3]${NC} Syncing Capacitor..."
npx cap sync android

# Generate AAB
echo -e "${YELLOW}[3/3]${NC} Generating AAB..."
cd "$ANDROID_DIR"
./gradlew bundleRelease

AAB_FILE="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_FILE" ]; then
    FILE_SIZE=$(du -h "$AAB_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✓ AAB generado exitosamente${NC}"
    echo -e "   📦 $AAB_FILE"
    echo -e "   📊 Tamaño: $FILE_SIZE"
    echo ""
else
    echo -e "${RED}❌ Error: AAB no generado${NC}"
    exit 1
fi
