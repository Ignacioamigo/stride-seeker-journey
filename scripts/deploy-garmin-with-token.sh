#!/bin/bash

# Script para desplegar Edge Functions de Garmin con token de acceso

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar el token de acceso"
    echo ""
    echo "Uso:"
    echo "  ./scripts/deploy-garmin-with-token.sh TU_TOKEN_AQUI"
    echo ""
    echo "O con variable de entorno:"
    echo "  export SUPABASE_ACCESS_TOKEN=TU_TOKEN_AQUI"
    echo "  ./scripts/deploy-garmin-functions.sh"
    echo ""
    exit 1
fi

export SUPABASE_ACCESS_TOKEN="$1"

echo "🚀 Desplegando Edge Functions de Garmin con token..."
echo "===================================================="
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







