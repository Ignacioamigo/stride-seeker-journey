#!/bin/bash

# Script de inicio rápido para integración de Garmin
# Este script te guía paso a paso en la configuración

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🏃 INTEGRACIÓN GARMIN CONNECT - QUICK START 🏃        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Este script te guiará paso a paso en la configuración de Garmin Connect.${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Función para preguntar continuar
ask_continue() {
    echo ""
    read -p "¿Continuar? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo -e "${YELLOW}⏸️  Script pausado. Ejecuta de nuevo cuando estés listo.${NC}"
        exit 0
    fi
    echo ""
}

# PASO 1: Documentación
echo -e "${BLUE}📚 PASO 1: DOCUMENTACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se han creado 5 documentos de referencia:"
echo ""
echo "  1. GARMIN_README.md                      - Índice y resumen"
echo "  2. GARMIN_INTEGRATION_SUMMARY.md         - Resumen ejecutivo"
echo "  3. GARMIN_IMPLEMENTATION_CHECKLIST.md    - Checklist detallado"
echo "  4. GARMIN_SETUP_GUIDE.md                 - Guía completa"
echo "  5. GARMIN_CREDENTIALS.md                 - Credenciales y URLs"
echo ""
echo -e "${GREEN}✅ Recomendado: Lee GARMIN_README.md primero${NC}"
echo ""
ask_continue

# PASO 2: Verificar Supabase CLI
echo -e "${BLUE}🔧 PASO 2: VERIFICAR SUPABASE CLI${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI no está instalado${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"
    supabase --version
fi

echo ""
ask_continue

# PASO 3: Login a Supabase
echo -e "${BLUE}🔑 PASO 3: LOGIN A SUPABASE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás logueado en Supabase${NC}"
    echo ""
    echo "Ejecutando: supabase login"
    echo ""
    supabase login
    
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}❌ Error en login. Ejecuta manualmente: supabase login${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Ya estás logueado en Supabase${NC}"
fi

echo ""
ask_continue

# PASO 4: Crear tabla
echo -e "${BLUE}🗄️  PASO 4: CREAR TABLA GARMIN_CONNECTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Debes crear la tabla manualmente en Supabase SQL Editor:"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor"
echo "2. Copia el contenido de: supabase/migrations/create_garmin_connections.sql"
echo "3. Pégalo en el SQL Editor"
echo "4. Haz clic en 'Run'"
echo ""
echo -e "${GREEN}📁 Archivo a copiar:${NC}"
echo "   supabase/migrations/create_garmin_connections.sql"
echo ""

read -p "¿Has creado la tabla? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⏸️  Crea la tabla primero y luego continúa.${NC}"
    exit 0
fi

echo ""

# PASO 5: Desplegar funciones
echo -e "${BLUE}⚡ PASO 5: DESPLEGAR EDGE FUNCTIONS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se desplegarán 4 Edge Functions:"
echo "  1. garmin-auth-start"
echo "  2. garmin-auth-callback"
echo "  3. garmin-webhook"
echo "  4. garmin-deregister"
echo ""
ask_continue

./scripts/deploy-garmin-functions.sh

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Error desplegando funciones${NC}"
    exit 1
fi

echo ""
ask_continue

# PASO 6: Variables de entorno
echo -e "${BLUE}⚙️  PASO 6: CONFIGURAR VARIABLES DE ENTORNO${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Debes añadir estas variables en Supabase:"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions"
echo ""
echo "2. Añade estas variables:"
echo ""
echo -e "${GREEN}GARMIN_CLIENT_ID${NC}=b8e7d840-e16b-4db5-84ba-b110a8e7a516"
echo -e "${GREEN}GARMIN_CLIENT_SECRET${NC}=nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0"
echo -e "${GREEN}GARMIN_REDIRECT_URI${NC}=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback"
echo ""
echo "3. Guarda los cambios"
echo ""

read -p "¿Has añadido las variables? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⏸️  Añade las variables y luego continúa.${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}Redeployando funciones para aplicar variables...${NC}"
echo ""

./scripts/deploy-garmin-functions.sh

echo ""
ask_continue

# PASO 7: Webhook en Garmin
echo -e "${BLUE}🔗 PASO 7: CONFIGURAR WEBHOOK EN GARMIN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Debes configurar el webhook en Garmin Developer Portal:"
echo ""
echo "1. Ve a: https://connectapi.garmin.com/developer/dashboard"
echo "2. Selecciona tu aplicación"
echo "3. Ve a 'Push Notifications' o 'Webhooks'"
echo "4. Añade esta URL:"
echo ""
echo -e "${GREEN}https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook${NC}"
echo ""
echo "5. Guarda los cambios"
echo ""

read -p "¿Has configurado el webhook? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⏸️  Configura el webhook y luego continúa.${NC}"
    exit 0
fi

echo ""
ask_continue

# PASO 8: Testing
echo -e "${BLUE}🧪 PASO 8: TESTING DE INTEGRACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ejecutando tests automáticos..."
echo ""

./scripts/test-garmin-integration.sh

echo ""
ask_continue

# PASO 9: UI
echo -e "${BLUE}🎨 PASO 9: AÑADIR UI A LA APP${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Edita el archivo: src/pages/Settings.tsx"
echo ""
echo "Añade estas líneas:"
echo ""
echo -e "${GREEN}import { ConnectGarmin } from '@/components/garmin/ConnectGarmin';${NC}"
echo ""
echo "// Dentro del render, después de ConnectStrava:"
echo -e "${GREEN}<ConnectGarmin />${NC}"
echo ""

read -p "¿Has añadido el componente? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${YELLOW}⏸️  Añade el componente y luego continúa.${NC}"
    exit 0
fi

echo ""

# RESUMEN FINAL
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                  ✅ ¡CONFIGURACIÓN COMPLETA! ✅                ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}La integración de Garmin Connect está lista.${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. 🔄 Reinicia tu app (npm run dev)"
echo "2. 📱 Abre Settings en la app"
echo "3. 🔗 Haz clic en 'Connect with Garmin'"
echo "4. ✅ Completa la autorización"
echo "5. 🏃 ¡Sal a correr con tu Garmin!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo ""
echo "  GARMIN_README.md                   - Índice general"
echo "  GARMIN_SETUP_GUIDE.md              - Guía detallada"
echo "  GARMIN_IMPLEMENTATION_CHECKLIST.md - Checklist completo"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}¿Necesitas ayuda? Ejecuta:${NC}"
echo "  ./scripts/test-garmin-integration.sh    # Testing"
echo "  supabase functions logs garmin-webhook  # Ver logs"
echo ""
echo -e "${GREEN}¡Disfruta de tu integración con Garmin! 🎉${NC}"
echo ""




