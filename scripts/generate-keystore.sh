#!/bin/bash

# Generate Android Keystore for BeRun App
# This script creates a release keystore for signing the Android app

echo "🔐 Generando Keystore para BeRun Android App"
echo "============================================="

# Navigate to android/app directory
cd "$(dirname "$0")/../android/app" || exit 1

# Check if keystore already exists
if [ -f "berun-release-key.keystore" ]; then
    echo "⚠️  Ya existe un keystore en este directorio."
    echo "¿Quieres crear uno nuevo? (esto sobrescribirá el existente)"
    read -p "Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
    rm -f berun-release-key.keystore
fi

echo ""
echo "📝 Por favor, proporciona la siguiente información:"
echo ""

# Prompt for keystore password
read -s -p "🔑 Contraseña del keystore (guárdala de forma segura): " STORE_PASSWORD
echo ""
read -s -p "🔑 Confirma la contraseña del keystore: " STORE_PASSWORD_CONFIRM
echo ""

if [ "$STORE_PASSWORD" != "$STORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Las contraseñas no coinciden."
    exit 1
fi

# Prompt for key password
read -s -p "🔑 Contraseña de la clave (puede ser igual a la del keystore): " KEY_PASSWORD
echo ""

echo ""
echo "🏢 Información del certificado:"

# Generate keystore
keytool -genkey -v \
    -keystore berun-release-key.keystore \
    -alias berun-key \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$STORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=BeRun Team, OU=BeRun, O=BeRun, L=Madrid, ST=Madrid, C=ES"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generado exitosamente!"
    echo ""
    echo "📄 Ahora creando archivo keystore.properties..."
    
    # Create keystore.properties file
    cat > keystore.properties << EOF
# Keystore configuration for BeRun Android App
# Generated on $(date)
BERUN_RELEASE_STORE_FILE=berun-release-key.keystore
BERUN_RELEASE_STORE_PASSWORD=$STORE_PASSWORD
BERUN_RELEASE_KEY_ALIAS=berun-key
BERUN_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOF

    echo "✅ Archivo keystore.properties creado!"
    echo ""
    echo "🔒 IMPORTANTE - INFORMACIÓN DE SEGURIDAD:"
    echo "========================================="
    echo "1. ⚠️  NUNCA subas estos archivos al control de versiones:"
    echo "   - berun-release-key.keystore"
    echo "   - keystore.properties"
    echo ""
    echo "2. 💾 HAZ BACKUP de estos archivos en un lugar seguro"
    echo ""
    echo "3. 📝 GUARDA las contraseñas de forma segura"
    echo "   Store Password: $STORE_PASSWORD"
    echo "   Key Password: $KEY_PASSWORD"
    echo ""
    echo "4. 🚫 Si pierdes el keystore, NO podrás actualizar la app en Play Store"
    echo ""
    echo "🚀 ¡Tu app está lista para ser firmada para release!"
    
else
    echo "❌ Error al generar el keystore."
    exit 1
fi
