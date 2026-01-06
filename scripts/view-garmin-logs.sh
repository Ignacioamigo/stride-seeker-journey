#!/bin/bash

# Script para ver los logs de Garmin en tiempo real

echo "🔍 Script para monitorear logs de Garmin"
echo "========================================="
echo ""
echo "Selecciona qué logs quieres ver:"
echo ""
echo "1. Webhook (actividades que llegan de Garmin) - EL MÁS IMPORTANTE"
echo "2. Auth Callback (cuando conectas Garmin)"
echo "3. Auth Start (inicio de conexión)"
echo "4. Todos los logs de Garmin"
echo ""
read -p "Elige una opción (1-4): " option

PROJECT_REF="uprohtkbghujvjwjnqyv"

case $option in
  1)
    echo ""
    echo "📡 Mostrando logs del webhook de Garmin (actividades)..."
    echo "👉 Deja esto abierto, ve a correr, y verás los logs aparecer aquí"
    echo "=================================================="
    echo ""
    supabase functions logs garmin-webhook --project-ref $PROJECT_REF
    ;;
  2)
    echo ""
    echo "🔐 Mostrando logs de autenticación callback..."
    echo "=================================================="
    echo ""
    supabase functions logs garmin-auth-callback --project-ref $PROJECT_REF
    ;;
  3)
    echo ""
    echo "🚀 Mostrando logs de inicio de autenticación..."
    echo "=================================================="
    echo ""
    supabase functions logs garmin-auth-start --project-ref $PROJECT_REF
    ;;
  4)
    echo ""
    echo "📊 Mostrando todos los logs de funciones Garmin..."
    echo "=================================================="
    echo ""
    echo "--- WEBHOOK ---"
    supabase functions logs garmin-webhook --project-ref $PROJECT_REF
    echo ""
    echo "--- AUTH CALLBACK ---"
    supabase functions logs garmin-auth-callback --project-ref $PROJECT_REF
    echo ""
    echo "--- AUTH START ---"
    supabase functions logs garmin-auth-start --project-ref $PROJECT_REF
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

