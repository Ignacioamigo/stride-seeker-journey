#!/bin/bash

# Script para verificar que el proyecto está listo para generar AAB de release

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
ERRORS=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BeRun - Pre-Release Verification                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para verificar
check() {
    local name=$1
    local command=$2
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name"
        return 0
    else
        echo -e "${RED}✗${NC} $name"
        ((ERRORS++))
        return 1
    fi
}

# Función para warning
warn() {
    local name=$1
    local command=$2
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $name"
        ((WARNINGS++))
        return 1
    fi
}

echo -e "${BLUE}[1] Verificando herramientas necesarias...${NC}"
check "Java JDK instalado" "java -version"
check "Node.js instalado" "node --version"
check "npm instalado" "npm --version"
check "Gradle wrapper presente" "test -f $ANDROID_DIR/gradlew"
echo ""

echo -e "${BLUE}[2] Verificando estructura del proyecto...${NC}"
check "Directorio android existe" "test -d $ANDROID_DIR"
check "build.gradle existe" "test -f $ANDROID_DIR/app/build.gradle"
check "AndroidManifest.xml existe" "test -f $ANDROID_DIR/app/src/main/AndroidManifest.xml"
check "package.json existe" "test -f $PROJECT_ROOT/package.json"
check "Capacitor config existe" "test -f $PROJECT_ROOT/capacitor.config.ts"
echo ""

echo -e "${BLUE}[3] Verificando configuración de firma...${NC}"
if [ -f "$ANDROID_DIR/app/keystore.properties" ]; then
    echo -e "${GREEN}✓${NC} keystore.properties existe"
    
    # Verificar que el keystore file existe
    KEYSTORE_FILE=$(grep "BERUN_RELEASE_STORE_FILE" "$ANDROID_DIR/app/keystore.properties" | cut -d'=' -f2)
    if [ -f "$KEYSTORE_FILE" ]; then
        echo -e "${GREEN}✓${NC} Keystore file existe: $KEYSTORE_FILE"
    else
        echo -e "${RED}✗${NC} Keystore file no encontrado: $KEYSTORE_FILE"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} keystore.properties no existe (se generará durante el build)"
    ((WARNINGS++))
fi
echo ""

echo -e "${BLUE}[4] Verificando configuración de la app...${NC}"

# Verificar applicationId
APP_ID=$(grep "applicationId" "$ANDROID_DIR/app/build.gradle" | head -1 | sed 's/.*"\(.*\)".*/\1/')
if [ "$APP_ID" = "stride.seeker.app" ]; then
    echo -e "${GREEN}✓${NC} Application ID: $APP_ID"
else
    echo -e "${YELLOW}⚠${NC} Application ID: $APP_ID (esperado: stride.seeker.app)"
    ((WARNINGS++))
fi

# Verificar versionCode
VERSION_CODE=$(grep "versionCode" "$ANDROID_DIR/app/build.gradle" | head -1 | sed 's/[^0-9]*//g')
echo -e "${GREEN}✓${NC} Version Code: $VERSION_CODE"

# Verificar versionName
VERSION_NAME=$(grep "versionName" "$ANDROID_DIR/app/build.gradle" | head -1 | sed 's/.*"\(.*\)".*/\1/')
echo -e "${GREEN}✓${NC} Version Name: $VERSION_NAME"

echo ""

echo -e "${BLUE}[5] Verificando dependencias...${NC}"
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe"
else
    echo -e "${RED}✗${NC} node_modules no existe. Ejecuta: npm install"
    ((ERRORS++))
fi

if [ -d "$PROJECT_ROOT/dist" ]; then
    echo -e "${GREEN}✓${NC} Build web existe (dist/)"
else
    echo -e "${YELLOW}⚠${NC} Build web no existe. Se generará durante el proceso"
    ((WARNINGS++))
fi
echo ""

echo -e "${BLUE}[6] Verificando configuración de Google Play...${NC}"
warn "Google Services configurado" "test -f $ANDROID_DIR/app/google-services.json"
echo ""

# Resumen
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}RESUMEN:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todo listo para generar el AAB${NC}"
    echo ""
    echo -e "Ejecuta: ${YELLOW}./scripts/generate-release-aab.sh${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencias encontradas${NC}"
    echo -e "${GREEN}✓ Puedes continuar con el build${NC}"
    echo ""
    echo -e "Ejecuta: ${YELLOW}./scripts/generate-release-aab.sh${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS errores encontrados${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS advertencias encontradas${NC}"
    fi
    echo ""
    echo -e "${RED}Corrige los errores antes de continuar${NC}"
    exit 1
fi
