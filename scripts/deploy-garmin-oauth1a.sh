#!/bin/bash
# Deploy Garmin OAuth 1.0a Edge Functions

echo "🚀 Deploying Garmin OAuth 1.0a functions..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

PROJECT_REF="uprohtkbghujvjwjnqyv"

echo ""
echo "📦 Deploying garmin-auth-start..."
supabase functions deploy garmin-auth-start --project-ref $PROJECT_REF

echo ""
echo "📦 Deploying garmin-auth-callback..."
supabase functions deploy garmin-auth-callback --project-ref $PROJECT_REF

echo ""
echo "📦 Deploying garmin-webhook..."
supabase functions deploy garmin-webhook --project-ref $PROJECT_REF

echo ""
echo "📦 Deploying garmin-deregister..."
supabase functions deploy garmin-deregister --project-ref $PROJECT_REF

echo ""
echo "✅ All Garmin OAuth 1.0a functions deployed!"
echo ""
echo "⚠️  IMPORTANT: Run this SQL migration in Supabase SQL Editor:"
echo "    supabase/migrations/20250118_garmin_oauth1a.sql"
echo ""
echo "📋 Don't forget to verify these environment variables in Supabase:"
echo "   - GARMIN_CLIENT_ID"
echo "   - GARMIN_CLIENT_SECRET"
echo "   - GARMIN_REDIRECT_URI"






