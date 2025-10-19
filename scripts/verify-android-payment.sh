#!/bin/bash

# Script de Verificación - Android Google Pay Setup
# Solo verifica Android, no afecta iOS

echo "🤖 Verificando configuración de Google Pay para Android..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Verificar que existe el servicio Android
echo "📱 1. Verificando servicio Google Play Billing..."
if [ -f "src/services/googlePlayBillingService.ts" ]; then
    echo -e "${GREEN}✅ googlePlayBillingService.ts encontrado${NC}"
else
    echo -e "${RED}❌ googlePlayBillingService.ts NO encontrado${NC}"
    ((ERRORS++))
fi

# 2. Verificar que la API key está configurada
echo ""
echo "🔑 2. Verificando API Key Android..."
if grep -q "sk_svesByUuhqTSWBZsjerCLblaFMSsH" "src/services/googlePlayBillingService.ts"; then
    echo -e "${GREEN}✅ API Key Android configurada${NC}"
else
    echo -e "${RED}❌ API Key Android NO configurada${NC}"
    ((ERRORS++))
fi

# 3. Verificar que PaywallPage tiene detección de plataforma
echo ""
echo "🎯 3. Verificando PaywallPage..."
if grep -q "platform === 'android'" "src/pages/PaywallPage.tsx"; then
    echo -e "${GREEN}✅ Detección de plataforma Android implementada${NC}"
else
    echo -e "${RED}❌ Detección de plataforma NO encontrada${NC}"
    ((ERRORS++))
fi

# 4. Verificar que iOS NO fue modificado
echo ""
echo "🍎 4. Verificando que iOS está intacto..."
if ! grep -q "PurchasesPlugin" "capacitor.config.ios.ts"; then
    echo -e "${GREEN}✅ iOS config intacta (sin RevenueCat)${NC}"
else
    echo -e "${YELLOW}⚠️  iOS config tiene referencias a RevenueCat${NC}"
    ((WARNINGS++))
fi

# 5. Verificar que storeKitService existe (iOS original)
echo ""
echo "📱 5. Verificando servicio iOS original..."
if [ -f "src/services/storeKitService.ts" ]; then
    echo -e "${GREEN}✅ storeKitService.ts existe (iOS original)${NC}"
else
    echo -e "${YELLOW}⚠️  storeKitService.ts no encontrado${NC}"
    ((WARNINGS++))
fi

# 6. Verificar que Android tiene RevenueCat
echo ""
echo "🤖 6. Verificando config Android..."
if grep -q "PurchasesPlugin" "capacitor.config.android.ts"; then
    echo -e "${GREEN}✅ Android config tiene RevenueCat${NC}"
else
    echo -e "${YELLOW}⚠️  Android config sin RevenueCat${NC}"
    ((WARNINGS++))
fi

# 7. Verificar que el plugin está instalado
echo ""
echo "📦 7. Verificando plugin RevenueCat..."
if grep -q "@revenuecat/purchases-capacitor" "package.json"; then
    echo -e "${GREEN}✅ Plugin RevenueCat instalado${NC}"
else
    echo -e "${RED}❌ Plugin RevenueCat NO instalado${NC}"
    ((ERRORS++))
fi

# 8. Verificar que Android está sincronizado
echo ""
echo "🔄 8. Verificando sincronización Android..."
if [ -d "android/app/src/main/assets/public" ]; then
    echo -e "${GREEN}✅ Android sincronizado${NC}"
else
    echo -e "${YELLOW}⚠️  Android no sincronizado, ejecuta: npx cap sync android${NC}"
    ((WARNINGS++))
fi

# 9. Verificar que dist existe
echo ""
echo "📦 9. Verificando build..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build existe${NC}"
else
    echo -e "${YELLOW}⚠️  No hay build, ejecuta: npm run build${NC}"
    ((WARNINGS++))
fi

# 10. Verificar que no hay archivos unificados antiguos
echo ""
echo "🧹 10. Verificando limpieza..."
if [ ! -f "src/services/revenueCatService.ts" ] && [ ! -f "src/config/revenueCatConfig.ts" ]; then
    echo -e "${GREEN}✅ Archivos unificados eliminados (correcto)${NC}"
else
    echo -e "${YELLOW}⚠️  Archivos unificados todavía existen${NC}"
    ((WARNINGS++))
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡PERFECTO! Todo está configurado correctamente${NC}"
    echo ""
    echo "📱 iOS: Implementación original intacta"
    echo "🤖 Android: Google Pay configurado y listo"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Configurar productos en Google Play Console"
    echo "   2. Configurar RevenueCat Dashboard"
    echo "   3. Testing en dispositivo Android"
    echo ""
    echo "   Ver: ANDROID_READY_TO_TEST.md"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuración correcta con advertencias${NC}"
    echo -e "${YELLOW}   Warnings: $WARNINGS${NC}"
    echo ""
    echo "   Revisa las advertencias arriba, pero puedes continuar."
else
    echo -e "${RED}❌ Hay errores que deben corregirse${NC}"
    echo -e "${RED}   Errores: $ERRORS${NC}"
    echo -e "${YELLOW}   Warnings: $WARNINGS${NC}"
    echo ""
    echo "   Contacta para ayuda."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $ERRORS
