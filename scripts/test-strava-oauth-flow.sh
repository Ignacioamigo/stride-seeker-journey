#!/bin/bash

# Script para probar el flujo OAuth de Strava manualmente

echo "🧪 Probando Flujo OAuth de Strava"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CLIENT_ID="186314"
CLIENT_SECRET="fa541a582f6dde856651e09cb546598865b000b15"
REDIRECT_URI="https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/strava-auth"

echo "1️⃣ Parámetros de OAuth:"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: ${CLIENT_SECRET:0:10}..."
echo "   Redirect URI: $REDIRECT_URI"
echo ""

echo "2️⃣ URL de autorización que se genera:"
AUTH_URL="https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=read,activity:read,activity:read_all"
echo "   $AUTH_URL"
echo ""

echo "3️⃣ Probando intercambio con código de prueba..."
echo "   (Esto fallará pero nos mostrará el error de Strava)"
echo ""

# Intentar intercambio con código de prueba para ver el error
RESPONSE=$(curl -s -X POST https://www.strava.com/oauth/token \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"${CLIENT_ID}\",
    \"client_secret\": \"${CLIENT_SECRET}\",
    \"code\": \"test_code_invalid\",
    \"grant_type\": \"authorization_code\"
  }")

echo "   Respuesta de Strava:"
echo "   $RESPONSE" | python3 -m json.tool 2>/dev/null || echo "   $RESPONSE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣ Verificando configuración en Strava Dashboard..."
echo ""
echo "   Ve a: https://www.strava.com/settings/api"
echo "   Verifica que en 'Authorization Callback Domain' esté:"
echo "   • uprohtkbghujvjwjnqyv.supabase.co"
echo ""
echo "   O en 'Website' (si no hay campo específico):"
echo "   • https://uprohtkbghujvjwjnqyv.supabase.co"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "5️⃣ IMPORTANTE: Posibles causas del error 'invalid':"
echo ""
echo "   A) Redirect URI no configurado o mal configurado"
echo "   B) Client Secret incorrecto"
echo "   C) Código de autorización ya usado o expirado"
echo "   D) redirect_uri en la petición no coincide con el configurado"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

