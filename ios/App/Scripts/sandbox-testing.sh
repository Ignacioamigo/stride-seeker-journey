#!/bin/bash

# 🧪 Script de Testing Apple Pay Sandbox
# Facilita el cambio entre diferentes entornos de testing

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🍎 Apple Pay Sandbox Testing Helper${NC}"
echo "======================================="

# Función para mostrar el menú
show_menu() {
    echo ""
    echo -e "${YELLOW}Selecciona el entorno de testing:${NC}"
    echo "1. 🧪 StoreKit Testing Local (rápido, offline)"
    echo "2. 🏖️  Apple Sandbox Real (realista, online)"
    echo "3. 📊 Ver estado actual"
    echo "4. 🧹 Limpiar datos de testing"
    echo "5. 📱 Configurar cuenta sandbox"
    echo "6. 🔍 Debug logs"
    echo "7. ❌ Salir"
    echo ""
}

# Función para configurar StoreKit Testing Local
setup_storekit_local() {
    echo -e "${GREEN}🧪 Configurando StoreKit Testing Local...${NC}"
    
    # Verificar que Configuration.storekit existe
    if [ ! -f "../App/Configuration.storekit" ]; then
        echo -e "${RED}❌ Error: Configuration.storekit no encontrado${NC}"
        exit 1
    fi
    
    echo "✅ Configuration.storekit encontrado"
    echo ""
    echo -e "${YELLOW}📋 Instrucciones:${NC}"
    echo "1. En Xcode: Product > Scheme > Edit Scheme"
    echo "2. Ir a Run > Options"
    echo "3. En 'StoreKit Configuration', seleccionar: Configuration.storekit"
    echo "4. Ejecutar app en simulador"
    echo ""
    echo -e "${GREEN}✨ Beneficios del StoreKit Local:${NC}"
    echo "• ⚡ Transacciones instantáneas"
    echo "• 🌐 No requiere internet"
    echo "• 🔄 Fácil reset de datos"
    echo "• 🎯 Control total del flujo"
    echo ""
}

# Función para configurar Apple Sandbox Real
setup_apple_sandbox() {
    echo -e "${GREEN}🏖️ Configurando Apple Sandbox Real...${NC}"
    echo ""
    echo -e "${YELLOW}📋 Pasos necesarios:${NC}"
    echo ""
    echo "1. 🔧 Configurar Xcode:"
    echo "   • Product > Scheme > Edit Scheme"
    echo "   • Run > Options"
    echo "   • StoreKit Configuration: None (desactivar)"
    echo ""
    echo "2. 📱 Configurar dispositivo iOS:"
    echo "   • Usar dispositivo físico (requerido)"
    echo "   • Settings > App Store"
    echo "   • Sandbox Account > Sign in"
    echo "   • Usuario: test.runner.strideseeker@gmail.com"
    echo "   • Password: TestRunner123!"
    echo ""
    echo "3. 🛍️ Productos en App Store Connect:"
    echo "   • stride_seeker_premium_monthly (€9.99/mes)"
    echo "   • stride_seeker_premium_yearly (€34.99/año)"
    echo "   • Estado: Ready for Sale"
    echo ""
    echo -e "${GREEN}✨ Beneficios del Sandbox Real:${NC}"
    echo "• 💳 Apple Pay UI real"
    echo "• 🔒 Touch ID/Face ID real"
    echo "• 📄 Receipts reales"
    echo "• 🔄 Renovaciones automáticas"
    echo ""
}

# Función para mostrar estado actual
show_current_status() {
    echo -e "${GREEN}📊 Estado Actual del Proyecto${NC}"
    echo "==============================="
    echo ""
    
    # Verificar Configuration.storekit
    if [ -f "../App/Configuration.storekit" ]; then
        echo -e "✅ Configuration.storekit: ${GREEN}Presente${NC}"
        echo "   • Productos: stride_seeker_premium_monthly, stride_seeker_premium_yearly"
        echo "   • Trial gratuito: 3 días"
        echo "   • Storefront: España (ESP)"
    else
        echo -e "❌ Configuration.storekit: ${RED}No encontrado${NC}"
    fi
    
    # Verificar archivos Swift
    echo ""
    echo "📁 Archivos Swift del Store:"
    if [ -f "../App/Store/StoreManager.swift" ]; then
        echo -e "   ✅ StoreManager.swift: ${GREEN}Presente${NC}"
    else
        echo -e "   ❌ StoreManager.swift: ${RED}No encontrado${NC}"
    fi
    
    if [ -f "../App/Store/SubscriptionManager.swift" ]; then
        echo -e "   ✅ SubscriptionManager.swift: ${GREEN}Presente${NC}"
    else
        echo -e "   ❌ SubscriptionManager.swift: ${RED}No encontrado${NC}"
    fi
    
    if [ -f "../App/Plugins/PaywallPlugin.swift" ]; then
        echo -e "   ✅ PaywallPlugin.swift: ${GREEN}Presente${NC}"
    else
        echo -e "   ❌ PaywallPlugin.swift: ${RED}No encontrado${NC}"
    fi
    
    echo ""
    echo "🎯 Product IDs configurados:"
    echo "   • stride_seeker_premium_monthly"
    echo "   • stride_seeker_premium_yearly"
    echo ""
}

# Función para limpiar datos de testing
clean_testing_data() {
    echo -e "${GREEN}🧹 Limpiando datos de testing...${NC}"
    echo ""
    echo -e "${YELLOW}Para StoreKit Local:${NC}"
    echo "• Simulador > Device > Erase All Content and Settings"
    echo "• Xcode > Product > Clean Build Folder"
    echo ""
    echo -e "${YELLOW}Para Sandbox Real:${NC}"
    echo "• Settings > App Store > Sandbox Account > Sign Out"
    echo "• Volver a iniciar sesión"
    echo "• Eliminar app y reinstalar"
    echo ""
    echo "🔄 Esto resetea el historial de compras para testing limpio"
}

# Función para configurar cuenta sandbox
setup_sandbox_account() {
    echo -e "${GREEN}📱 Configuración de Cuenta Sandbox${NC}"
    echo "===================================="
    echo ""
    echo -e "${YELLOW}Cuentas sandbox disponibles:${NC}"
    echo ""
    echo "🇪🇸 Cuenta España:"
    echo "   Email: test.runner.strideseeker@gmail.com"
    echo "   Password: TestRunner123!"
    echo "   País: España"
    echo "   Moneda: EUR"
    echo ""
    echo "🇺🇸 Cuenta USA (para testing multi-región):"
    echo "   Email: test.premium.user@gmail.com"
    echo "   Password: TestPremium123!"
    echo "   País: United States"
    echo "   Moneda: USD"
    echo ""
    echo -e "${YELLOW}⚠️ Importante:${NC}"
    echo "• Usar SOLO en dispositivos físicos"
    echo "• NO usar Apple ID personal"
    echo "• Cerrar sesión antes de cambiar de cuenta"
    echo "• Verificar que Touch ID/Face ID está configurado"
    echo ""
}

# Función para debug logs
debug_logs() {
    echo -e "${GREEN}🔍 Debug Logs Apple Pay${NC}"
    echo "========================"
    echo ""
    echo -e "${YELLOW}Comandos útiles para debugging:${NC}"
    echo ""
    echo "📱 Ver logs de StoreKit en tiempo real:"
    echo "log stream --predicate 'subsystem == \"com.apple.storekit\"'"
    echo ""
    echo "🔍 Filtrar logs de la app:"
    echo "log stream --predicate 'process == \"App\"'"
    echo ""
    echo "💳 Ver transacciones en Console.app:"
    echo "• Abrir Console.app"
    echo "• Filtrar por: 'StoreKit' o 'transaction'"
    echo ""
    echo "🧪 Verificar entorno actual en app:"
    echo "• Buscar logs que muestren: 'StoreKit Testing' o 'Sandbox'"
    echo ""
}

# Función principal
main() {
    while true; do
        show_menu
        read -p "Selecciona una opción (1-7): " choice
        
        case $choice in
            1)
                setup_storekit_local
                ;;
            2)
                setup_apple_sandbox
                ;;
            3)
                show_current_status
                ;;
            4)
                clean_testing_data
                ;;
            5)
                setup_sandbox_account
                ;;
            6)
                debug_logs
                ;;
            7)
                echo -e "${GREEN}👋 ¡Hasta luego! Happy testing! 🧪${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción inválida. Por favor selecciona 1-7.${NC}"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Verificar que estamos en el directorio correcto
if [ ! -f "../App.xcworkspace" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde ios/App/Scripts/${NC}"
    echo "Uso: cd ios/App/Scripts && ./sandbox-testing.sh"
    exit 1
fi

# Ejecutar función principal
main
