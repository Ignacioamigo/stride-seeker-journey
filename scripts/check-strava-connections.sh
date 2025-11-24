#!/bin/bash

# Script para verificar y ayudar a resolver el Error 403 de Strava

echo "🔍 Verificando estado de conexiones de Strava..."
echo ""

STRAVA_CLIENT_ID="186314"
SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"

echo "📋 Información de tu aplicación Strava:"
echo "   Client ID: ${STRAVA_CLIENT_ID}"
echo "   Dashboard: https://www.strava.com/settings/api"
echo ""

echo "🔗 Enlaces importantes:"
echo "   1. Ver aplicaciones autorizadas:"
echo "      https://www.strava.com/settings/apps"
echo ""
echo "   2. Ver detalles de tu app:"
echo "      https://www.strava.com/settings/api"
echo ""
echo "   3. Supabase Dashboard:"
echo "      https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv"
echo ""

echo "✅ Pasos para resolver Error 403:"
echo ""
echo "   PASO 1: Desconectar conexión existente"
echo "   ──────────────────────────────────────"
echo "   1. Abre: https://www.strava.com/settings/apps"
echo "   2. Busca 'BeRun' en la lista"
echo "   3. Haz clic en 'Revoke Access' (Revocar acceso)"
echo "   4. Confirma la acción"
echo "   5. Espera 1-2 minutos"
echo ""

echo "   PASO 2: Verificar contador en Strava"
echo "   ──────────────────────────────────────"
echo "   1. Abre: https://www.strava.com/settings/api"
echo "   2. Haz clic en tu aplicación 'BeRun'"
echo "   3. Verifica que muestre:"
echo "      'Número de deportistas conectados: 0'"
echo ""

echo "   PASO 3: Limpiar base de datos (opcional)"
echo "   ──────────────────────────────────────"
echo "   1. Abre Supabase SQL Editor:"
echo "      https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/sql"
echo "   2. Ejecuta:"
echo "      DELETE FROM strava_connections;"
echo ""

echo "   PASO 4: Verificar variables de entorno"
echo "   ──────────────────────────────────────"
echo "   1. Abre:"
echo "      https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions"
echo "   2. Verifica que existan:"
echo "      - STRAVA_CLIENT_ID=186314"
echo "      - STRAVA_CLIENT_SECRET=fa541a582f6dde856651e09cb546598865b000b15"
echo "      - STRAVA_WEBHOOK_VERIFY_TOKEN=berun_webhook_verify_2024"
echo ""

echo "   PASO 5: Probar conexión de nuevo"
echo "   ──────────────────────────────────────"
echo "   1. Abre la app BeRun"
echo "   2. Ve a: Perfil > Integraciones"
echo "   3. Haz clic en 'Conectar' en Strava"
echo "   4. Autoriza la aplicación"
echo ""

echo "📧 Si necesitas aumentar el límite:"
echo "   Email: developers@strava.com"
echo "   Asunto: Request to Increase Connected Athletes Limit - BeRun App"
echo "   Menciona: Client ID 186314"
echo ""

echo "🔍 Verificación de Edge Functions:"
echo ""

# Verificar strava-auth
STATUS_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/functions/v1/strava-auth" 2>/dev/null)
if [ "$STATUS_AUTH" = "401" ] || [ "$STATUS_AUTH" = "200" ] || [ "$STATUS_AUTH" = "400" ]; then
  echo "   ✅ strava-auth: Desplegada (HTTP $STATUS_AUTH)"
else
  echo "   ❌ strava-auth: No desplegada o con error (HTTP $STATUS_AUTH)"
fi

# Verificar strava-webhook
STATUS_WEBHOOK=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/functions/v1/strava-webhook" 2>/dev/null)
if [ "$STATUS_WEBHOOK" = "200" ] || [ "$STATUS_WEBHOOK" = "403" ] || [ "$STATUS_WEBHOOK" = "405" ]; then
  echo "   ✅ strava-webhook: Desplegada (HTTP $STATUS_WEBHOOK)"
else
  echo "   ⚠️  strava-webhook: Verificar (HTTP $STATUS_WEBHOOK)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 El Error 403 ocurre porque:"
echo "   - Tu app tiene límite de 1 deportista conectado"
echo "   - Ya hay 1 conexión registrada en Strava"
echo "   - Aunque tu tabla en Supabase esté vacía, Strava"
echo "     mantiene su propio registro de conexiones OAuth"
echo ""
echo "✅ Solución: Desconectar desde Strava settings/apps"
echo ""

