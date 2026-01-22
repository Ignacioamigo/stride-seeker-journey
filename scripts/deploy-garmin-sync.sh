#!/bin/bash

echo "🚀 Deploying Garmin sync function..."
echo ""

cd "$(dirname "$0")/.."

PROJECT_REF="uprohtkbghujvjwjnqyv"

echo "📦 Deploying garmin-sync..."
supabase functions deploy garmin-sync --project-ref $PROJECT_REF --no-verify-jwt

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Garmin sync function deployed successfully!"
  echo ""
  echo "📝 Next steps:"
  echo "1. Open your app"
  echo "2. Go to Settings"
  echo "3. Click 'Sincronizar actividades'"
  echo "4. Your Garmin activities will be imported!"
else
  echo ""
  echo "❌ Deployment failed"
  echo "Check the error message above"
  exit 1
fi




