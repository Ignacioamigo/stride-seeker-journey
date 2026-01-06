#!/bin/bash

# Script para desplegar todas las Edge Functions de Garmin

echo "🚀 Desplegando Edge Functions de Garmin..."
echo "==========================================="
echo ""

PROJECT_REF="uprohtkbghujvjwjnqyv"

# Verificar que Supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado."
    echo ""
    echo "📦 Para instalar:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Login check
echo "🔑 Verificando login..."
if ! supabase projects list &> /dev/null; then
    echo "❌ No estás logueado en Supabase"
    echo ""
    echo "Por favor ejecuta: supabase login"
    exit 1
fi

echo "✅ Login verificado"
echo ""

# Desplegar funciones
echo "📦 Desplegando funciones..."
echo ""

echo "1️⃣ Desplegando garmin-auth-start..."
supabase functions deploy garmin-auth-start --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ garmin-auth-start desplegado"
else
    echo "❌ Error desplegando garmin-auth-start"
    exit 1
fi
echo ""

echo "2️⃣ Desplegando garmin-auth-callback..."
supabase functions deploy garmin-auth-callback --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ garmin-auth-callback desplegado"
else
    echo "❌ Error desplegando garmin-auth-callback"
    exit 1
fi
echo ""

echo "3️⃣ Desplegando garmin-webhook..."
supabase functions deploy garmin-webhook --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ garmin-webhook desplegado"
else
    echo "❌ Error desplegando garmin-webhook"
    exit 1
fi
echo ""

echo "4️⃣ Desplegando garmin-deregister..."
supabase functions deploy garmin-deregister --project-ref $PROJECT_REF
if [ $? -eq 0 ]; then
    echo "✅ garmin-deregister desplegado"
else
    echo "❌ Error desplegando garmin-deregister"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Todas las funciones desplegadas exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 URLs de las funciones:"
echo ""
echo "garmin-auth-start:"
echo "  https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-start"
echo ""
echo "garmin-auth-callback:"
echo "  https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback"
echo ""
echo "garmin-webhook:"
echo "  https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook"
echo ""
echo "garmin-deregister:"
echo "  https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-deregister"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANTE: Ahora debes configurar las variables de entorno"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo "2. Añade estas variables:"
echo ""
echo "   GARMIN_CLIENT_ID=b8e7d840-e16b-4db5-84ba-b110a8e7a516"
echo "   GARMIN_CLIENT_SECRET=nc4ZgcLZP5JD6y/TJIxzDiK2t6XXEVYg31yCFf3jYk0"
echo "   GARMIN_REDIRECT_URI=https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-auth-callback"
echo ""
echo "3. Después de añadir las variables, REDEPLOYA las funciones con:"
echo "   ./scripts/deploy-garmin-functions.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Siguiente paso:"
echo "   - Lee GARMIN_SETUP_GUIDE.md para configurar el webhook en Garmin"
echo ""




