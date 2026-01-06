#!/bin/bash

# Script para crear la tabla garmin_connections en Supabase

echo "🔧 Creando tabla garmin_connections en Supabase..."
echo "================================================="
echo ""

SUPABASE_URL="https://uprohtkbghujvjwjnqyv.supabase.co"

echo "📋 Este script ejecutará la migración SQL directamente en Supabase"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Ve a: https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor"
echo "   2. Abre el archivo: supabase/migrations/create_garmin_connections.sql"
echo "   3. Copia TODO el contenido"
echo "   4. Pégalo en el SQL Editor de Supabase"
echo "   5. Haz clic en 'Run'"
echo ""
echo "✅ La tabla se creará con:"
echo "   - Foreign key a auth.users(id)"
echo "   - Row Level Security habilitado"
echo "   - Índices para búsquedas rápidas"
echo "   - Columnas en published_activities_simple para Garmin"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 ESTRUCTURA DE LA TABLA:"
echo ""
cat << 'EOF'
garmin_connections:
├── id (UUID) - Primary Key
├── user_auth_id (UUID) - Foreign Key → auth.users(id) ✅
├── garmin_user_id (TEXT) - Garmin API User ID (UNIQUE)
├── access_token (TEXT) - OAuth2 access token
├── refresh_token (TEXT) - OAuth2 refresh token (nullable)
├── token_expires_at (TIMESTAMPTZ) - Token expiration
├── athlete_name (TEXT) - User's name
├── athlete_email (TEXT) - User's email
├── created_at (TIMESTAMPTZ) - Auto
└── updated_at (TIMESTAMPTZ) - Auto

Constraints:
- UNIQUE(user_auth_id) → Un usuario solo puede tener una conexión Garmin
- UNIQUE(garmin_user_id) → Un usuario Garmin solo puede conectarse a una cuenta
- ON DELETE CASCADE → Si se borra el usuario, se borra la conexión
EOF
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 URL del SQL Editor:"
echo "   https://supabase.com/dashboard/project/uprohtkbghujvjwjnqyv/editor"
echo ""
echo "📂 Archivo a copiar:"
echo "   supabase/migrations/create_garmin_connections.sql"
echo ""




