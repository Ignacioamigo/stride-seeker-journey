#!/bin/bash

# Script para probar la integración de Garmin

echo "🧪 Testing Garmin Integration..."
echo "================================="
echo ""

SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA1NzAsImV4cCI6MjA2MzM0NjU3MH0.WQQ0jxNacORbXNZhMg_H5pW1g-VUJ8tiEiv44VBnnX4"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Test 1: Verificar tabla garmin_connections"
echo "----------------------------------------------"

TABLE_CHECK=$(curl -s \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/garmin_connections?select=count" 2>&1)

if echo "$TABLE_CHECK" | grep -q "count"; then
    echo -e "${GREEN}✅ Tabla garmin_connections existe${NC}"
else
    echo -e "${RED}❌ Tabla garmin_connections NO existe${NC}"
    echo "   Ejecuta: ./scripts/create-garmin-connections.sh"
fi
echo ""

echo "📋 Test 2: Verificar Edge Function garmin-auth-start"
echo "----------------------------------------------------"

AUTH_START_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  "$SUPABASE_URL/functions/v1/garmin-auth-start")

if [ "$AUTH_START_CHECK" = "400" ] || [ "$AUTH_START_CHECK" = "401" ]; then
    echo -e "${GREEN}✅ Function garmin-auth-start está desplegada (responde $AUTH_START_CHECK)${NC}"
elif [ "$AUTH_START_CHECK" = "404" ]; then
    echo -e "${RED}❌ Function garmin-auth-start NO está desplegada (404)${NC}"
    echo "   Ejecuta: ./scripts/deploy-garmin-functions.sh"
else
    echo -e "${YELLOW}⚠️  Function garmin-auth-start responde con código: $AUTH_START_CHECK${NC}"
fi
echo ""

echo "📋 Test 3: Verificar Edge Function garmin-auth-callback"
echo "-------------------------------------------------------"

CALLBACK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  "$SUPABASE_URL/functions/v1/garmin-auth-callback")

if [ "$CALLBACK_CHECK" = "400" ] || [ "$CALLBACK_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Function garmin-auth-callback está desplegada (responde $CALLBACK_CHECK)${NC}"
elif [ "$CALLBACK_CHECK" = "404" ]; then
    echo -e "${RED}❌ Function garmin-auth-callback NO está desplegada (404)${NC}"
    echo "   Ejecuta: ./scripts/deploy-garmin-functions.sh"
else
    echo -e "${YELLOW}⚠️  Function garmin-auth-callback responde con código: $CALLBACK_CHECK${NC}"
fi
echo ""

echo "📋 Test 4: Verificar Edge Function garmin-webhook"
echo "-------------------------------------------------"

WEBHOOK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  "$SUPABASE_URL/functions/v1/garmin-webhook")

if [ "$WEBHOOK_CHECK" = "405" ] || [ "$WEBHOOK_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Function garmin-webhook está desplegada (responde $WEBHOOK_CHECK)${NC}"
elif [ "$WEBHOOK_CHECK" = "404" ]; then
    echo -e "${RED}❌ Function garmin-webhook NO está desplegada (404)${NC}"
    echo "   Ejecuta: ./scripts/deploy-garmin-functions.sh"
else
    echo -e "${YELLOW}⚠️  Function garmin-webhook responde con código: $WEBHOOK_CHECK${NC}"
fi
echo ""

echo "📋 Test 5: Verificar Edge Function garmin-deregister"
echo "----------------------------------------------------"

DEREGISTER_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  "$SUPABASE_URL/functions/v1/garmin-deregister")

if [ "$DEREGISTER_CHECK" = "400" ] || [ "$DEREGISTER_CHECK" = "401" ]; then
    echo -e "${GREEN}✅ Function garmin-deregister está desplegada (responde $DEREGISTER_CHECK)${NC}"
elif [ "$DEREGISTER_CHECK" = "404" ]; then
    echo -e "${RED}❌ Function garmin-deregister NO está desplegada (404)${NC}"
    echo "   Ejecuta: ./scripts/deploy-garmin-functions.sh"
else
    echo -e "${YELLOW}⚠️  Function garmin-deregister responde con código: $DEREGISTER_CHECK${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contar tests pasados
PASSED=0
TOTAL=5

# Check tabla
if echo "$TABLE_CHECK" | grep -q "count"; then
    ((PASSED++))
fi

# Check functions
if [ "$AUTH_START_CHECK" = "400" ] || [ "$AUTH_START_CHECK" = "401" ]; then
    ((PASSED++))
fi

if [ "$CALLBACK_CHECK" = "400" ] || [ "$CALLBACK_CHECK" = "200" ]; then
    ((PASSED++))
fi

if [ "$WEBHOOK_CHECK" = "405" ] || [ "$WEBHOOK_CHECK" = "200" ]; then
    ((PASSED++))
fi

if [ "$DEREGISTER_CHECK" = "400" ] || [ "$DEREGISTER_CHECK" = "401" ]; then
    ((PASSED++))
fi

echo "Tests pasados: $PASSED/$TOTAL"
echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}✅ ¡Todos los tests pasaron!${NC}"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Configurar variables de entorno en Supabase"
    echo "   2. Configurar webhook en Garmin Developer Portal"
    echo "   3. Probar conexión desde la app"
    echo ""
    echo "📚 Lee GARMIN_SETUP_GUIDE.md para más detalles"
else
    echo -e "${RED}❌ Algunos tests fallaron${NC}"
    echo ""
    echo "📝 Acciones requeridas:"
    if ! echo "$TABLE_CHECK" | grep -q "count"; then
        echo "   - Crear tabla: ./scripts/create-garmin-connections.sh"
    fi
    if [ "$AUTH_START_CHECK" = "404" ] || [ "$CALLBACK_CHECK" = "404" ] || [ "$WEBHOOK_CHECK" = "404" ] || [ "$DEREGISTER_CHECK" = "404" ]; then
        echo "   - Desplegar funciones: ./scripts/deploy-garmin-functions.sh"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"




