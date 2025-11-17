#!/bin/bash

# Script para arreglar el plugin StoreKit
# Ejecuta esto para limpiar y reconstruir todo

echo "🔧 Arreglando plugin StoreKit..."
echo ""

# 1. Ir al directorio del proyecto
cd /Users/nachoamigo/stride-seeker-journey

# 2. Limpiar el build de iOS
echo "📦 1/5: Limpiando builds anteriores..."
rm -rf ios/App/build
rm -rf ios/App/DerivedData

# 3. Limpiar node_modules de Capacitor (opcional pero ayuda)
echo "📦 2/5: Limpiando caché de Capacitor..."
rm -rf node_modules/.cache

# 4. Rebuild web
echo "🌐 3/5: Construyendo web app..."
npm run build

# 5. Sync con iOS
echo "📱 4/5: Sincronizando con iOS..."
npx cap sync ios

# 6. Abrir Xcode
echo "🚀 5/5: Abriendo Xcode..."
npx cap open ios

echo ""
echo "✅ Listo!"
echo ""
echo "AHORA EN XCODE:"
echo "1. Product → Clean Build Folder (⇧⌘K)"
echo "2. Product → Build (⌘B)"
echo "3. Product → Run (⌘R)"
echo ""

