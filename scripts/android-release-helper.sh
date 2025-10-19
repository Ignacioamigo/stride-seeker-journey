#!/bin/bash

# Helper interactivo para generar AAB de release

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗██████╗ ██╗   ██╗███╗   ██╗                ║
║   ██╔══██╗██╔════╝██╔══██╗██║   ██║████╗  ██║                ║
║   ██████╔╝█████╗  ██████╔╝██║   ██║██╔██╗ ██║                ║
║   ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║                ║
║   ██████╔╝███████╗██║  ██║╚██████╔╝██║ ╚████║                ║
║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝                ║
║                                                               ║
║         Android Release Helper - Generador de AAB            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}¿Qué deseas hacer?${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Verificar que todo está listo"
echo -e "  ${GREEN}2)${NC} Generar AAB completo (primera vez o con keystore)"
echo -e "  ${GREEN}3)${NC} Generar AAB rápido (keystore ya configurado)"
echo -e "  ${GREEN}4)${NC} Solo compilar web y sincronizar"
echo -e "  ${GREEN}5)${NC} Ver información del proyecto"
echo -e "  ${GREEN}6)${NC} Limpiar builds anteriores"
echo -e "  ${RED}0)${NC} Salir"
echo ""
read -p "Selecciona una opción [0-6]: " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}Ejecutando verificación...${NC}"
        echo ""
        "$PROJECT_ROOT/scripts/verify-release-ready.sh"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⚠️  Este proceso generará un keystore si no existe${NC}"
        echo -e "${YELLOW}⚠️  Guarda las contraseñas en un lugar SEGURO${NC}"
        echo ""
        read -p "¿Continuar? (s/n): " confirm
        if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
            "$PROJECT_ROOT/scripts/generate-release-aab.sh"
        else
            echo -e "${RED}Cancelado${NC}"
        fi
        ;;
    3)
        echo ""
        if [ ! -f "$PROJECT_ROOT/android/app/keystore.properties" ]; then
            echo -e "${RED}❌ keystore.properties no encontrado${NC}"
            echo -e "${YELLOW}Usa la opción 2 primero para generar el keystore${NC}"
            exit 1
        fi
        "$PROJECT_ROOT/scripts/quick-release-aab.sh"
        ;;
    4)
        echo ""
        echo -e "${BLUE}Compilando web...${NC}"
        cd "$PROJECT_ROOT"
        npm run build
        echo ""
        echo -e "${BLUE}Sincronizando Capacitor...${NC}"
        npx cap sync android
        echo ""
        echo -e "${GREEN}✓ Listo. Ahora puedes generar el AAB con la opción 2 o 3${NC}"
        ;;
    5)
        echo ""
        echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BLUE}║  Información del Proyecto                             ║${NC}"
        echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        # Leer información del build.gradle
        APP_ID=$(grep "applicationId" "$PROJECT_ROOT/android/app/build.gradle" | head -1 | sed 's/.*"\(.*\)".*/\1/')
        VERSION_CODE=$(grep "versionCode" "$PROJECT_ROOT/android/app/build.gradle" | head -1 | sed 's/[^0-9]*//g')
        VERSION_NAME=$(grep "versionName" "$PROJECT_ROOT/android/app/build.gradle" | head -1 | sed 's/.*"\(.*\)".*/\1/')
        
        echo -e "${CYAN}Application ID:${NC} $APP_ID"
        echo -e "${CYAN}Version Code:${NC} $VERSION_CODE"
        echo -e "${CYAN}Version Name:${NC} $VERSION_NAME"
        echo ""
        
        # Verificar si existe keystore
        if [ -f "$PROJECT_ROOT/android/app/keystore.properties" ]; then
            echo -e "${GREEN}✓${NC} Keystore configurado"
            KEYSTORE_FILE=$(grep "BERUN_RELEASE_STORE_FILE" "$PROJECT_ROOT/android/app/keystore.properties" | cut -d'=' -f2)
            if [ -f "$KEYSTORE_FILE" ]; then
                echo -e "${GREEN}✓${NC} Keystore file existe"
                
                # Información del keystore
                echo ""
                echo -e "${CYAN}Información del Keystore:${NC}"
                keytool -list -v -keystore "$KEYSTORE_FILE" -storepass "$(grep "BERUN_RELEASE_STORE_PASSWORD" "$PROJECT_ROOT/android/app/keystore.properties" | cut -d'=' -f2)" 2>/dev/null | grep -A 5 "Alias name:" || echo "No se pudo leer (verifica la contraseña)"
            else
                echo -e "${RED}✗${NC} Keystore file no encontrado"
            fi
        else
            echo -e "${YELLOW}⚠${NC} Keystore no configurado"
        fi
        
        echo ""
        
        # Verificar si existe AAB previo
        AAB_FILE="$PROJECT_ROOT/android/app/build/outputs/bundle/release/app-release.aab"
        if [ -f "$AAB_FILE" ]; then
            FILE_SIZE=$(du -h "$AAB_FILE" | cut -f1)
            FILE_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$AAB_FILE" 2>/dev/null || stat -c "%y" "$AAB_FILE" 2>/dev/null | cut -d'.' -f1)
            echo -e "${GREEN}✓${NC} AAB existente:"
            echo -e "   Ubicación: $AAB_FILE"
            echo -e "   Tamaño: $FILE_SIZE"
            echo -e "   Fecha: $FILE_DATE"
        else
            echo -e "${YELLOW}⚠${NC} No hay AAB generado aún"
        fi
        echo ""
        ;;
    6)
        echo ""
        echo -e "${YELLOW}Limpiando builds anteriores...${NC}"
        cd "$PROJECT_ROOT/android"
        ./gradlew clean
        echo ""
        echo -e "${GREEN}✓ Limpieza completada${NC}"
        echo ""
        ;;
    0)
        echo ""
        echo -e "${BLUE}¡Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Proceso completado${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
