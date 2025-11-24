#!/bin/bash

# Script para configurar el webhook de Strava
# Ejecutar después de desplegar las Edge Functions

echo "🔧 Configurando webhook de Strava..."
echo ""

# Variables - ACTUALIZAR CON TUS VALORES
STRAVA_CLIENT_ID="186314"
STRAVA_CLIENT_SECRET="fa541a582f6dde856651e09cb546598865b00b15"
SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"
WEBHOOK_VERIFY_TOKEN="berun_webhook_verify_2024"
CALLBACK_URL="${SUPABASE_URL}/functions/v1/strava-webhook"

echo "📝 Configuración:"
echo "   Client ID: ${STRAVA_CLIENT_ID}"
echo "   Callback URL: ${CALLBACK_URL}"
echo "   Verify Token: ${WEBHOOK_VERIFY_TOKEN}"
echo ""

# Crear subscription
echo "🚀 Creando subscription..."
RESPONSE=$(curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=${STRAVA_CLIENT_ID} \
  -F client_secret=${STRAVA_CLIENT_SECRET} \
  -F callback_url=${CALLBACK_URL} \
  -F verify_token=${WEBHOOK_VERIFY_TOKEN})

echo ""
echo "📊 Respuesta de Strava:"
echo "${RESPONSE}" | python3 -m json.tool || echo "${RESPONSE}"
echo ""

# Obtener subscription ID
SUBSCRIPTION_ID=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'ERROR'))" 2>/dev/null)

if [ "${SUBSCRIPTION_ID}" != "ERROR" ] && [ -n "${SUBSCRIPTION_ID}" ]; then
  echo "✅ Webhook configurado exitosamente!"
  echo "   Subscription ID: ${SUBSCRIPTION_ID}"
  echo ""
  echo "💾 Guarda este ID para referencia futura"
else
  echo "❌ Error al configurar webhook"
  echo "   Verifica las credenciales y que la Edge Function esté desplegada"
fi

echo ""
echo "📋 Para ver las subscriptions existentes:"
echo "   curl -G https://www.strava.com/api/v3/push_subscriptions \\"
echo "     -d client_id=${STRAVA_CLIENT_ID} \\"
echo "     -d client_secret=${STRAVA_CLIENT_SECRET}"
echo ""
echo "🗑️  Para eliminar una subscription:"
echo "   curl -X DELETE https://www.strava.com/api/v3/push_subscriptions/{SUBSCRIPTION_ID} \\"
echo "     -F client_id=${STRAVA_CLIENT_ID} \\"
echo "     -F client_secret=${STRAVA_CLIENT_SECRET}"
echo ""

