#!/bin/bash

# Script para verificar el estado de las Edge Functions de Strava

echo "🔍 Verificando Edge Functions desplegadas..."
echo ""

SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NzQxODksImV4cCI6MjA0NjA1MDE4OX0.dxwL_ieBxQRl2S4P8sNxsgwf0NXCHGBBOv3VrJh-AjE"

echo "1️⃣ Probando strava-auth (sin auth)..."
RESPONSE_1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${SUPABASE_URL}/functions/v1/strava-auth?code=test&state=test" 2>&1)
HTTP_CODE_1=$(echo "$RESPONSE_1" | grep "HTTP_STATUS" | cut -d: -f2)
BODY_1=$(echo "$RESPONSE_1" | grep -v "HTTP_STATUS")

if [ "$HTTP_CODE_1" = "401" ]; then
  echo "   ⚠️  Requiere autenticación (HTTP 401)"
  echo ""
  echo "2️⃣ Probando strava-auth (con anon key)..."
  RESPONSE_2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/functions/v1/strava-auth?code=test&state=test" 2>&1)
  HTTP_CODE_2=$(echo "$RESPONSE_2" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY_2=$(echo "$RESPONSE_2" | grep -v "HTTP_STATUS" | head -5)
  
  if [ "$HTTP_CODE_2" = "401" ]; then
    echo "   ❌ Sigue requiriendo autenticación"
    echo "   📝 Respuesta: $BODY_2"
  elif [ "$HTTP_CODE_2" = "400" ] || [ "$HTTP_CODE_2" = "200" ]; then
    echo "   ✅ Función respondiendo correctamente (HTTP $HTTP_CODE_2)"
    echo "   📝 Respuesta: $BODY_2"
  else
    echo "   ⚠️  HTTP $HTTP_CODE_2"
    echo "   📝 Respuesta: $BODY_2"
  fi
elif [ "$HTTP_CODE_1" = "404" ]; then
  echo "   ❌ Función NO está desplegada (HTTP 404)"
elif [ "$HTTP_CODE_1" = "400" ] || [ "$HTTP_CODE_1" = "200" ]; then
  echo "   ✅ Función respondiendo correctamente (HTTP $HTTP_CODE_1)"
  echo "   📝 Respuesta (primeras 5 líneas):"
  echo "$BODY_1" | head -5
else
  echo "   ⚠️  HTTP $HTTP_CODE_1"
  echo "   📝 Respuesta: $BODY_1"
fi

echo ""
echo "3️⃣ Probando strava-webhook (GET - verificación)..."
RESPONSE_3=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${SUPABASE_URL}/functions/v1/strava-webhook" 2>&1)
HTTP_CODE_3=$(echo "$RESPONSE_3" | grep "HTTP_STATUS" | cut -d: -f2)
BODY_3=$(echo "$RESPONSE_3" | grep -v "HTTP_STATUS")

if [ "$HTTP_CODE_3" = "401" ]; then
  echo "   ⚠️  Requiere autenticación (HTTP 401)"
  echo "   Probando con anon key..."
  RESPONSE_4=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/functions/v1/strava-webhook" 2>&1)
  HTTP_CODE_4=$(echo "$RESPONSE_4" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY_4=$(echo "$RESPONSE_4" | grep -v "HTTP_STATUS")
  
  if [ "$HTTP_CODE_4" = "403" ] || [ "$HTTP_CODE_4" = "405" ] || [ "$HTTP_CODE_4" = "200" ]; then
    echo "   ✅ Función respondiendo (HTTP $HTTP_CODE_4)"
  else
    echo "   ⚠️  HTTP $HTTP_CODE_4"
    echo "   📝 Respuesta: $BODY_4"
  fi
elif [ "$HTTP_CODE_3" = "404" ]; then
  echo "   ❌ Función NO está desplegada (HTTP 404)"
elif [ "$HTTP_CODE_3" = "403" ] || [ "$HTTP_CODE_3" = "405" ] || [ "$HTTP_CODE_3" = "200" ]; then
  echo "   ✅ Función respondiendo correctamente (HTTP $HTTP_CODE_3)"
else
  echo "   ⚠️  HTTP $HTTP_CODE_3"
  echo "   📝 Respuesta: $BODY_3"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Interpretación de resultados:"
echo ""
echo "   ✅ HTTP 200/400: Función activa y respondiendo"
echo "   ✅ HTTP 403/405: Función activa (método no permitido es normal)"
echo "   ⚠️  HTTP 401: Función requiere configuración de permisos"
echo "   ❌ HTTP 404: Función NO está desplegada"
echo ""

if [ "$HTTP_CODE_1" = "401" ] || [ "$HTTP_CODE_3" = "401" ]; then
  echo "⚠️  ACCIÓN REQUERIDA: Configurar funciones como públicas"
  echo ""
  echo "   1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions"
  echo "   2. Haz clic en cada función (strava-auth, strava-webhook)"
  echo "   3. Ve a 'Settings' o 'Configuration'"
  echo "   4. Busca 'Verify JWT' o 'JWT verification' y desactívalo"
  echo "   5. O configura 'Public' o 'Anonymous access' si está disponible"
  echo ""
fi

echo "🔗 Enlaces útiles:"
echo "   Dashboard Functions: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/functions"
echo "   Settings: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/settings/functions"
echo ""

