#!/bin/bash

# Script para verificar la configuración de Strava

echo "🔍 Verificando configuración de Strava..."
echo ""

SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"

# 1. Verificar que la función strava-auth existe
echo "1️⃣ Verificando Edge Function strava-auth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/functions/v1/strava-auth")
if [ "$STATUS" = "401" ] || [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  echo "   ✅ Función strava-auth está desplegada (HTTP $STATUS)"
else
  echo "   ❌ Función strava-auth NO está desplegada (HTTP $STATUS)"
  echo "   💡 Necesitas desplegar desde Supabase Dashboard"
fi
echo ""

# 2. Verificar que la función strava-webhook existe
echo "2️⃣ Verificando Edge Function strava-webhook..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/functions/v1/strava-webhook")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "403" ] || [ "$STATUS" = "405" ]; then
  echo "   ✅ Función strava-webhook está desplegada (HTTP $STATUS)"
else
  echo "   ❌ Función strava-webhook NO está desplegada (HTTP $STATUS)"
  echo "   💡 Necesitas desplegar desde Supabase Dashboard"
fi
echo ""

# 3. Instrucciones para verificar variables de entorno
echo "3️⃣ Variables de entorno necesarias en Supabase:"
echo "   Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions"
echo "   Verifica que existan estas variables:"
echo "   - STRAVA_CLIENT_ID=186314"
echo "   - STRAVA_CLIENT_SECRET=fa541a582f6dde856651e09cb546598865b000b15"
echo "   - STRAVA_WEBHOOK_VERIFY_TOKEN=berun_webhook_verify_2024"
echo ""

# 4. Instrucciones para desplegar si falta
echo "4️⃣ Si las funciones NO están desplegadas:"
echo "   Opción A: Desde Supabase Dashboard"
echo "   1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions"
echo "   2. Haz clic en 'Deploy a new function'"
echo "   3. Sube el archivo: supabase/functions/strava-auth/index.ts"
echo "   4. Repite para: supabase/functions/strava-webhook/index.ts"
echo ""
echo "   Opción B: Con Docker (si lo tienes instalado)"
echo "   docker run --rm -it \\"
echo "     -v \$(pwd):/workspace \\"
echo "     -w /workspace \\"
echo "     supabase/cli:latest functions deploy strava-auth --project-ref uprohtkbghujvjwjnqyv"
echo ""

# 5. Verificar tabla en Supabase
echo "5️⃣ Verificar tabla strava_connections:"
echo "   Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor"
echo "   Busca la tabla 'strava_connections'"
echo "   Si está vacía pero Strava muestra 1 conexión, el problema es:"
echo "   - La Edge Function no está guardando los datos"
echo "   - O las variables de entorno no están configuradas"
echo ""

# 6. Solución para el Error 403
echo "6️⃣ Solución para Error 403 (límite de deportistas):"
echo "   1. Ve a: https://www.strava.com/settings/apps"
echo "   2. Busca 'BeRun' y haz clic en 'Revoke Access'"
echo "   3. Esto liberará el slot para conectar de nuevo"
echo ""

echo "✅ Verificación completa!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica variables de entorno en Supabase"
echo "   2. Desconecta conexión antigua en Strava"
echo "   3. Intenta conectar de nuevo desde la app"

