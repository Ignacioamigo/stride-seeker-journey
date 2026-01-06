#!/bin/bash

# Script para probar manualmente el webhook de Garmin

echo "🧪 Probando el webhook de Garmin..."
echo ""

WEBHOOK_URL="https://uprohtkbghujvjwjnqyv.supabase.co/functions/v1/garmin-webhook"

# Payload de prueba simulando una actividad de Garmin
PAYLOAD='{
  "activitySummaries": [
    {
      "userId": "TEST_USER_123",
      "summaryId": "test-summary-001",
      "activityId": 999999999,
      "activityName": "Test Run - Manual Test",
      "durationInSeconds": 1800,
      "startTimeInSeconds": 1736182800,
      "startTimeOffsetInSeconds": 0,
      "activityType": "RUNNING",
      "distanceInMeters": 5000,
      "averageHeartRateInBeatsPerMinute": 150,
      "averageSpeedInMetersPerSecond": 2.78,
      "activeKilocalories": 350,
      "deviceName": "Test Device",
      "manual": false
    }
  ]
}'

echo "📡 Enviando payload de prueba al webhook..."
echo ""
echo "URL: $WEBHOOK_URL"
echo ""
echo "Payload:"
echo "$PAYLOAD" | jq '.'
echo ""
echo "📤 Enviando..."
echo ""

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s)

echo "📥 Respuesta:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "200"; then
  echo "✅ El webhook respondió correctamente (200 OK)"
  echo ""
  echo "Ahora ve a los logs para ver si procesó la actividad:"
  echo "  supabase functions logs garmin-webhook --project-ref uprohtkbghujvjwjnqyv"
else
  echo "❌ El webhook NO respondió correctamente"
  echo "Verifica los logs para más detalles"
fi

