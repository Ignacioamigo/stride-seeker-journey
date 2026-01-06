#!/bin/bash

# Script para redimensionar imagen de branding a 300x300px para Garmin

echo "🎨 Redimensionando imagen de branding para Garmin..."
echo "=================================================="

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick no está instalado."
    echo ""
    echo "📦 Para instalar ImageMagick:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Descargar desde https://imagemagick.org/script/download.php"
    exit 1
fi

# Rutas
SOURCE_IMAGE="public/BeRun_mark_only_1024_blue1463FF.png"
OUTPUT_IMAGE="public/garmin-branding-300x300.png"

# Verificar que existe la imagen fuente
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ No se encontró la imagen fuente: $SOURCE_IMAGE"
    exit 1
fi

echo "📸 Imagen fuente: $SOURCE_IMAGE"
echo "📐 Redimensionando a 300x300px..."
echo ""

# Redimensionar manteniendo proporciones y centrando en fondo transparente
convert "$SOURCE_IMAGE" \
    -resize 300x300 \
    -gravity center \
    -background transparent \
    -extent 300x300 \
    "$OUTPUT_IMAGE"

if [ $? -eq 0 ]; then
    echo "✅ ¡Imagen redimensionada exitosamente!"
    echo ""
    echo "📁 Archivo creado: $OUTPUT_IMAGE"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 PRÓXIMOS PASOS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Sube el archivo a Netlify:"
    echo "   - Ve a: https://app.netlify.com/"
    echo "   - Selecciona tu sitio"
    echo "   - Arrastra la carpeta 'public' completa"
    echo ""
    echo "2. O usa esta URL después de subir:"
    echo "   https://sage-puffpuff-06c024.netlify.app/garmin-branding-300x300.png"
    echo ""
    echo "3. Copia la URL y úsala en el formulario de Garmin"
    echo ""
else
    echo "❌ Error al redimensionar la imagen"
    exit 1
fi




