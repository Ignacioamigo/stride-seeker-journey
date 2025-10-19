#!/bin/bash

# Script para generar Android App Bundle (.aab) firmado para Google Play
# Autor: Android Release Engineer
# Fecha: $(date +%Y-%m-%d)

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BeRun - Android App Bundle Generator                     ║${NC}"
echo -e "${BLUE}║  Generando AAB firmado para Google Play                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Directorios
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
KEYSTORE_FILE="$ANDROID_DIR/app/berun-release-key.keystore"
KEYSTORE_PROPS="$ANDROID_DIR/app/keystore.properties"

cd "$PROJECT_ROOT"

# ============================================
# PASO 1: Verificar/Generar Keystore
# ============================================
echo -e "${YELLOW}[PASO 1/5]${NC} Verificando keystore..."

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo -e "${YELLOW}⚠️  No se encontró el keystore. Generando uno nuevo...${NC}"
    echo ""
    echo -e "${BLUE}Por favor, proporciona la siguiente información:${NC}"
    
    # Solicitar contraseñas
    read -sp "Contraseña del keystore (mínimo 6 caracteres): " STORE_PASSWORD
    echo ""
    read -sp "Confirma la contraseña del keystore: " STORE_PASSWORD_CONFIRM
    echo ""
    
    if [ "$STORE_PASSWORD" != "$STORE_PASSWORD_CONFIRM" ]; then
        echo -e "${RED}❌ Las contraseñas no coinciden${NC}"
        exit 1
    fi
    
    if [ ${#STORE_PASSWORD} -lt 6 ]; then
        echo -e "${RED}❌ La contraseña debe tener al menos 6 caracteres${NC}"
        exit 1
    fi
    
    read -sp "Contraseña de la key (puede ser la misma): " KEY_PASSWORD
    echo ""
    echo ""
    
    # Solicitar información del certificado
    echo -e "${BLUE}Información del certificado:${NC}"
    read -p "Nombre y apellidos: " DNAME_CN
    read -p "Unidad organizativa (ej: Desarrollo): " DNAME_OU
    read -p "Organización (ej: BeRun): " DNAME_O
    read -p "Ciudad: " DNAME_L
    read -p "Estado/Provincia: " DNAME_ST
    read -p "Código de país (2 letras, ej: ES): " DNAME_C
    
    # Generar keystore
    echo ""
    echo -e "${BLUE}Generando keystore...${NC}"
    keytool -genkeypair \
        -v \
        -storetype PKCS12 \
        -keystore "$KEYSTORE_FILE" \
        -alias berun-key \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$STORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=$DNAME_CN, OU=$DNAME_OU, O=$DNAME_O, L=$DNAME_L, ST=$DNAME_ST, C=$DNAME_C"
    
    # Crear archivo de propiedades
    cat > "$KEYSTORE_PROPS" << EOF
# Keystore configuration for BeRun Android App
# IMPORTANT: NEVER commit this file to version control

BERUN_RELEASE_STORE_FILE=$KEYSTORE_FILE
BERUN_RELEASE_STORE_PASSWORD=$STORE_PASSWORD
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOF
    
    echo -e "${GREEN}✓ Keystore generado exitosamente${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda el archivo $KEYSTORE_FILE en un lugar seguro${NC}"
    echo -e "${YELLOW}⚠️  Si lo pierdes, no podrás actualizar tu app en Google Play${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Keystore encontrado${NC}"
fi

# Verificar que existe el archivo de propiedades
if [ ! -f "$KEYSTORE_PROPS" ]; then
    echo -e "${RED}❌ No se encontró el archivo keystore.properties${NC}"
    echo -e "${YELLOW}Crea el archivo en: $KEYSTORE_PROPS${NC}"
    echo -e "${YELLOW}Usa keystore.properties.example como referencia${NC}"
    exit 1
fi

# ============================================
# PASO 2: Limpiar builds anteriores
# ============================================
echo -e "${YELLOW}[PASO 2/5]${NC} Limpiando builds anteriores..."
cd "$ANDROID_DIR"
./gradlew clean > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Limpieza completada${NC}"

# ============================================
# PASO 3: Compilar proyecto web
# ============================================
echo -e "${YELLOW}[PASO 3/5]${NC} Compilando proyecto web..."
cd "$PROJECT_ROOT"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Compilación web exitosa${NC}"
else
    echo -e "${RED}❌ Error en la compilación web${NC}"
    exit 1
fi

# ============================================
# PASO 4: Sincronizar con Capacitor
# ============================================
echo -e "${YELLOW}[PASO 4/5]${NC} Sincronizando con Capacitor..."
npx cap sync android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sincronización exitosa${NC}"
else
    echo -e "${RED}❌ Error en la sincronización${NC}"
    exit 1
fi

# ============================================
# PASO 5: Generar AAB firmado
# ============================================
echo -e "${YELLOW}[PASO 5/5]${NC} Generando Android App Bundle (.aab)..."
cd "$ANDROID_DIR"
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ AAB GENERADO EXITOSAMENTE                              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    AAB_FILE="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
    
    if [ -f "$AAB_FILE" ]; then
        # Obtener información del archivo
        FILE_SIZE=$(du -h "$AAB_FILE" | cut -f1)
        
        echo -e "${BLUE}📦 Archivo generado:${NC}"
        echo -e "   Ubicación: ${GREEN}$AAB_FILE${NC}"
        echo -e "   Tamaño: ${GREEN}$FILE_SIZE${NC}"
        echo ""
        
        # Copiar a directorio de release
        RELEASE_DIR="$ANDROID_DIR/app/release"
        mkdir -p "$RELEASE_DIR"
        cp "$AAB_FILE" "$RELEASE_DIR/"
        echo -e "${GREEN}✓ Copia guardada en: $RELEASE_DIR/app-release.aab${NC}"
        echo ""
        
        # Verificar firma
        echo -e "${BLUE}🔐 Verificando firma del AAB...${NC}"
        jarsigner -verify -verbose -certs "$AAB_FILE" | grep -A 3 "Signed by"
        echo ""
        
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🎉 PRÓXIMOS PASOS:${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "1. Ve a: ${YELLOW}https://play.google.com/console${NC}"
        echo -e "2. Selecciona tu app o crea una nueva"
        echo -e "3. Ve a: ${YELLOW}Producción > Prueba interna${NC}"
        echo -e "4. Crea una nueva versión"
        echo -e "5. Sube el archivo: ${GREEN}app-release.aab${NC}"
        echo -e "6. Completa la información de la versión"
        echo -e "7. Envía para revisión"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
        echo -e "   • Guarda el keystore en un lugar seguro"
        echo -e "   • Haz backup del archivo: ${YELLOW}berun-release-key.keystore${NC}"
        echo -e "   • Nunca compartas las contraseñas"
        echo ""
    else
        echo -e "${RED}❌ No se encontró el archivo AAB generado${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Error al generar el AAB${NC}"
    exit 1
fi