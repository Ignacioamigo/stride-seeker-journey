#!/bin/bash

# Script para desplegar la migración de Garmin a OAuth 2.0 PKCE
# Uso: ./scripts/deploy-garmin-oauth2.sh

set -e

PROJECT_REF="uprohtkbghujvjwjnqyv"

echo "=================================================="
echo "  Desplegando Garmin OAuth 2.0 PKCE Migration"
echo "=================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Paso 1: Desplegar Edge Functions
echo "📦 Paso 1/3: Desplegando Edge Functions..."
echo ""

echo "  🔄 Desplegando garmin-auth-start..."
supabase functions deploy garmin-auth-start --project-ref $PROJECT_REF || {
    echo "❌ Error desplegando garmin-auth-start"
    exit 1
}

echo "  🔄 Desplegando garmin-auth-callback..."
supabase functions deploy garmin-auth-callback --project-ref $PROJECT_REF || {
    echo "❌ Error desplegando garmin-auth-callback"
    exit 1
}

echo "  🔄 Desplegando garmin-refresh-token..."
supabase functions deploy garmin-refresh-token --project-ref $PROJECT_REF || {
    echo "❌ Error desplegando garmin-refresh-token"
    exit 1
}

echo "  🔄 Desplegando garmin-webhook (sin cambios)..."
supabase functions deploy garmin-webhook --project-ref $PROJECT_REF || {
    echo "⚠️  Advertencia: Error desplegando garmin-webhook (puede ser opcional)"
}

echo "  🔄 Desplegando garmin-deregister (sin cambios)..."
supabase functions deploy garmin-deregister --project-ref $PROJECT_REF || {
    echo "⚠️  Advertencia: Error desplegando garmin-deregister (puede ser opcional)"
}

echo ""
echo "✅ Edge Functions desplegadas correctamente"
echo ""

# Paso 2: Recordatorio de Migration
echo "📋 Paso 2/3: Migration de Base de Datos"
echo ""
echo "⚠️  IMPORTANTE: Debes ejecutar la migration manualmente en Supabase:"
echo ""
echo "1. Abre: https://supabase.com/dashboard/project/$PROJECT_REF/editor"
echo "2. Ejecuta el SQL de: supabase/migrations/20250101_update_garmin_connections_oauth2.sql"
echo ""
echo "Presiona ENTER cuando hayas completado la migration..."
read -r

# Paso 3: Verificar variables de entorno
echo "🔐 Paso 3/3: Verificación de Variables de Entorno"
echo ""
echo "Verifica que estas variables estén configuradas en:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo ""
echo "  ✓ GARMIN_CLIENT_ID (tu Consumer Key)"
echo "  ✓ GARMIN_CLIENT_SECRET (tu Consumer Secret)"
echo "  ✓ GARMIN_REDIRECT_URI (https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback)"
echo "  ✓ APP_URL (opcional, ej: https://berun.app)"
echo ""
echo "Presiona ENTER cuando hayas verificado las variables..."
read -r

echo ""
echo "=================================================="
echo "  ✅ Despliegue Completado"
echo "=================================================="
echo ""
echo "Próximos pasos:"
echo "1. Ejecuta: npm run build && npx cap sync ios"
echo "2. Prueba la conexión con Garmin en la app"
echo "3. Verifica los logs en Supabase"
echo ""
echo "Documentación completa: GARMIN_OAUTH2_MIGRATION.md"
echo ""







