#!/bin/bash

# Script para monitorear la conexión de Strava en tiempo real

echo "🔍 Monitor de Conexión Strava"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Este script verificará periódicamente si la conexión se guardó en Supabase."
echo "Presiona Ctrl+C para detener."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm9odGtiZ2h1anZqd2pucXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NzQxODksImV4cCI6MjA0NjA1MDE4OX0.dxwL_ieBxQRl2S4P8sNxsgwf0NXCHGBBOv3VrJh-AjE"

echo "⏰ $(date '+%H:%M:%S') - Iniciando monitoreo..."
echo ""

ITERATION=0
while true; do
  ITERATION=$((ITERATION + 1))
  
  # Verificar si hay conexiones en la tabla
  RESPONSE=$(curl -s \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    "${SUPABASE_URL}/rest/v1/strava_connections?select=user_auth_id,strava_user_id,athlete_name,created_at" 2>&1)
  
  # Contar conexiones
  COUNT=$(echo "$RESPONSE" | grep -o "user_auth_id" | wc -l | tr -d ' ')
  
  TIMESTAMP=$(date '+%H:%M:%S')
  
  if [ "$COUNT" -gt 0 ]; then
    echo "✅ [$TIMESTAMP] ¡CONEXIÓN DETECTADA!"
    echo ""
    echo "Datos de la conexión:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Conexión guardada exitosamente en Supabase"
    echo ""
    echo "Puedes verificar en:"
    echo "https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor"
    echo ""
    break
  else
    if [ $((ITERATION % 5)) -eq 0 ]; then
      echo "⏳ [$TIMESTAMP] Esperando conexión... (verificación #$ITERATION)"
    fi
  fi
  
  sleep 3
done

echo ""
echo "Monitor detenido. Presiona Enter para salir..."

