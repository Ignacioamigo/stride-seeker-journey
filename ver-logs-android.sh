#!/bin/bash

# Script para ver logs de Android relacionados con pagos
# Uso: ./ver-logs-android.sh

echo "🔍 Capturando logs de Android..."
echo "📱 Asegúrate de tener el dispositivo Android conectado por USB"
echo "⚡ Ahora abre la app e intenta comprar. Los logs aparecerán aquí."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Limpiar logs previos
adb logcat -c

# Capturar logs relevantes con colores
adb logcat | grep --color=always -E "🔍|RevenueCat|Purchase|Offering|Product|Billing|💳|📦|✅|❌"

