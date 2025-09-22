#!/bin/bash

# 🔍 Script de Verificación - Apple Pay Setup
# Verifica que toda la configuración de Apple Pay está correcta

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verificación de Configuración Apple Pay${NC}"
echo "=========================================="
echo ""

# Contador de verificaciones
checks_passed=0
total_checks=0

# Función para verificar algo
check() {
    local description="$1"
    local condition="$2"
    
    total_checks=$((total_checks + 1))
    
    if eval "$condition"; then
        echo -e "✅ ${GREEN}$description${NC}"
        checks_passed=$((checks_passed + 1))
        return 0
    else
        echo -e "❌ ${RED}$description${NC}"
        return 1
    fi
}

# Función para mostrar advertencia
warn() {
    echo -e "⚠️  ${YELLOW}$1${NC}"
}

# Función para mostrar información
info() {
    echo -e "ℹ️  ${BLUE}$1${NC}"
}

echo "🧪 Verificando archivos de configuración..."
echo ""

# Verificar archivos de configuración
check "Configuration.storekit existe" "[ -f '../App/Configuration.storekit' ]"
check "StoreManager.swift existe" "[ -f '../App/Store/StoreManager.swift' ]"
check "SubscriptionManager.swift existe" "[ -f '../App/Store/SubscriptionManager.swift' ]"
check "PaywallPlugin.swift existe" "[ -f '../App/Plugins/PaywallPlugin.swift' ]"
check "PaywallView.swift existe" "[ -f '../App/Views/PaywallView.swift' ]"

echo ""
echo "📱 Verificando localizaciones..."
echo ""

check "Localización en español existe" "[ -f '../App/es.lproj/Localizable.strings' ]"
check "Localización en inglés existe" "[ -f '../App/en.lproj/Localizable.strings' ]"

echo ""
echo "🔧 Verificando configuración StoreKit..."
echo ""

# Verificar contenido de Configuration.storekit
if [ -f "../App/Configuration.storekit" ]; then
    if grep -q "stride_seeker_premium_monthly" "../App/Configuration.storekit"; then
        check "Product ID mensual configurado" "true"
    else
        check "Product ID mensual configurado" "false"
    fi
    
    if grep -q "stride_seeker_premium_yearly" "../App/Configuration.storekit"; then
        check "Product ID anual configurado" "true"
    else
        check "Product ID anual configurado" "false"
    fi
    
    if grep -q "P3D" "../App/Configuration.storekit"; then
        check "Trial gratuito de 3 días configurado" "true"
    else
        check "Trial gratuito de 3 días configurado" "false"
    fi
    
    if grep -q '"storefront" : "ESP"' "../App/Configuration.storekit"; then
        check "Storefront España configurado" "true"
    else
        check "Storefront España configurado" "false"
    fi
else
    warn "No se puede verificar contenido de Configuration.storekit"
fi

echo ""
echo "🏗️ Verificando estructura del proyecto..."
echo ""

check "Directorio Store/ existe" "[ -d '../App/Store' ]"
check "Directorio Plugins/ existe" "[ -d '../App/Plugins' ]"
check "Directorio Views/ existe" "[ -d '../App/Views' ]"
check "App.xcworkspace existe" "[ -f '../App.xcworkspace' ]"

echo ""
echo "📋 Verificando archivos de documentación..."
echo ""

check "Guía de setup sandbox creada" "[ -f '../../ApplePaySandboxSetup.md' ]"
check "Instrucciones generales existen" "[ -f '../../ApplePaySetupInstructions.md' ]"
check "Script de testing existe" "[ -f './sandbox-testing.sh' ]"

echo ""
echo "=" | tr '=' '=' | while read -r line; do echo -n "="; done; echo "="
echo ""

# Mostrar resumen
if [ $checks_passed -eq $total_checks ]; then
    echo -e "${GREEN}🎉 ¡Excelente! Todas las verificaciones pasaron ($checks_passed/$total_checks)${NC}"
    echo ""
    echo -e "${GREEN}✨ Tu configuración de Apple Pay está completa${NC}"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "1. Ejecutar: ./sandbox-testing.sh"
    echo "2. Configurar entorno de testing preferido"
    echo "3. Probar flujo de compras en la app"
else
    echo -e "${YELLOW}⚠️  Algunas verificaciones fallaron ($checks_passed/$total_checks)${NC}"
    echo ""
    echo "🔧 Elementos que necesitan atención:"
    echo ""
fi

echo ""
echo "📊 Información adicional del proyecto:"
echo ""

# Mostrar información adicional
if [ -f "../App/Configuration.storekit" ]; then
    echo "📱 Productos configurados en StoreKit:"
    if grep -q "stride_seeker_premium_monthly" "../App/Configuration.storekit"; then
        monthly_price=$(grep -A 5 "stride_seeker_premium_monthly" "../App/Configuration.storekit" | grep "displayPrice" | cut -d'"' -f4)
        echo "   • Premium Mensual: €$monthly_price"
    fi
    if grep -q "stride_seeker_premium_yearly" "../App/Configuration.storekit"; then
        yearly_price=$(grep -A 5 "stride_seeker_premium_yearly" "../App/Configuration.storekit" | grep "displayPrice" | cut -d'"' -f4)
        echo "   • Premium Anual: €$yearly_price"
    fi
fi

echo ""
echo "🔗 Enlaces útiles:"
echo "• App Store Connect: https://appstoreconnect.apple.com"
echo "• Documentación StoreKit: https://developer.apple.com/storekit/"
echo "• Guía de Testing: https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_storekit_testing_in_xcode"

echo ""
echo "💡 Consejos para testing:"
echo "• Usa StoreKit local para desarrollo rápido"
echo "• Usa Sandbox real para testing antes del lanzamiento"
echo "• Siempre prueba en dispositivo físico para Sandbox real"
echo "• Configura Touch ID/Face ID en el dispositivo de testing"

echo ""
if [ $checks_passed -eq $total_checks ]; then
    echo -e "${GREEN}🍎 ¡Tu entorno sandbox está listo para Apple Pay! 💳${NC}"
else
    echo -e "${YELLOW}🔧 Completa los elementos faltantes y vuelve a ejecutar este script${NC}"
fi
