import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Calendar, Bell, Lock, Tag, RotateCcw } from 'lucide-react';
import { googlePlayBillingNativeService } from '../services/googlePlayBillingNativeService';
import { storeKitService } from '../services/storeKitService';
import { Capacitor } from '@capacitor/core';

const PaywallPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<'monthly' | 'yearly'>('yearly');
  const [progress, setProgress] = useState(91);
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    // Animate progress to 100%
    const timer = setTimeout(() => setProgress(100), 1000);
    
    // Setup listener para detectar cuando se completa una compra
    const handlePurchaseComplete = (success: boolean, productId?: string) => {
      if (success) {
        console.log('🎉 Compra detectada como completada, cerrando paywall...');
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        
        // Disparar evento para actualizar estado en toda la app
        window.dispatchEvent(new CustomEvent('subscription-updated', { 
          detail: { isPremium: true, productId } 
        }));
        
        // Navegar a la app
        navigate('/plan');
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
        }, 500);
      }
    };
    
    // Registrar el listener si estamos en iOS
    if (storeKitService.isAvailable()) {
      storeKitService.addPurchaseListener(handlePurchaseComplete);
    }
    
    return () => {
      clearTimeout(timer);
      // Limpiar listener al desmontar
      if (storeKitService.isAvailable()) {
        storeKitService.removePurchaseListener(handlePurchaseComplete);
      }
    };
  }, [navigate, selectedProduct]);

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      const productId = selectedProduct === 'yearly' 
        ? 'berun_premium_yearly' 
        : 'berun_premium_monthly';
      
      if (platform === 'ios' && Capacitor.isNativePlatform()) {
        // IMPLEMENTACIÓN REAL con StoreKit 2
        console.log('🍎 Iniciando compra iOS con StoreKit...');
        const result = await storeKitService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa, actualizando estado y navegando...');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Disparar evento para actualizar estado en toda la app
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          // Navegar inmediatamente
          navigate('/plan');
          
          // Mostrar alerta después de navegar
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          // No mostrar error si el usuario canceló
        } else if (result.error) {
          alert(`Error: ${result.error}`);
        }
      } else if (platform === 'android' && googlePlayBillingNativeService.isAvailable()) {
        // IMPLEMENTACIÓN REAL Android con Google Play Billing
        console.log('🤖 Iniciando compra Android con Google Play...');
        const result = await googlePlayBillingNativeService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa, actualizando estado y navegando...');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Disparar evento para actualizar estado en toda la app
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          // Navegar inmediatamente
          navigate('/plan');
          
          // Mostrar alerta después de navegar
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          // No mostrar error si el usuario canceló
        } else {
          alert(`Error en la compra: ${result.error || 'Por favor, inténtalo de nuevo.'}`);
        }
      } else {
        // Fallback para web/simulador
        console.log('🌐 Using web fallback (web platform)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const paymentMethod = platform === 'ios' ? 'Apple Pay' : platform === 'android' ? 'Google Pay' : 'Payment';
        
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        
        // Navegar primero
        navigate('/plan');
        
        // Mostrar alerta después
        setTimeout(() => {
          alert(`📱 En dispositivo real aparecería ${paymentMethod}\n\n¡Bienvenido a Premium! Plan ${selectedProduct === 'yearly' ? 'anual' : 'mensual'} activado.`);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert(`Error en la compra: ${error.message || 'Error desconocido'}`);
    }
    
    setIsLoading(false);
  };

  const handleDiscountCode = () => {
    if (discountCode.trim() === 'BeRun2025.gratiss') {
      // Código válido - bypass del pago
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('subscriptionType', 'discount');
      localStorage.setItem('trialStartDate', new Date().toISOString());
      navigate('/plan');
    } else {
      alert('Código de descuento inválido');
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'ios' && storeKitService.isAvailable()) {
        console.log('🔄 Restaurando compras iOS...');
        const result = await storeKitService.restore();
        
        if (result.success && result.count > 0) {
          // Compras restauradas exitosamente
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', 'restored');
          alert(`✅ Compras restauradas exitosamente!\n${result.count} compra(s) encontrada(s).`);
          navigate('/plan');
        } else {
          alert('No se encontraron compras previas para restaurar.');
        }
      } else if (platform === 'android' && googlePlayBillingNativeService.isAvailable()) {
        console.log('🔄 Restaurando compras Android...');
        const result = await googlePlayBillingNativeService.restore();
        if (result.success) {
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', 'restored');
          alert('✅ Compras restauradas exitosamente!');
          navigate('/plan');
        } else {
          alert('No se encontraron compras previas para restaurar.');
        }
        // En Android, Google Play Billing maneja esto automáticamente
        // Podríamos implementar una verificación del estado de suscripción
        alert('🔄 Verificando compras...\n\nEn Android, las compras se restauran automáticamente al iniciar sesión con tu cuenta de Google.');
      } else {
        alert('La restauración de compras solo está disponible en dispositivos móviles.');
      }
    } catch (error) {
      console.error('Error restaurando compras:', error);
      alert('Hubo un error al restaurar las compras. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBillingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-4 space-y-4 overflow-y-auto">
        
        {/* Progress Section */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-gray-900">
            {progress}%
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            Estamos configurando<br />todo para ti
          </h1>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mx-auto max-w-xs">
            <div 
              className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-gray-600 text-base">
            Finalizando resultados...
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Inicia tu prueba GRATUITA<br />de 3 días para continuar.
          </h2>
          <p className="text-base text-gray-600 mt-2">
            Acceso completo durante 3 días, luego se cobrará automáticamente
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <TimelineItem
            icon={<Lock className="w-5 h-5" />}
            iconColor="bg-orange-500"
            title="Hoy"
            description="Desbloquea tu entrenamiento 100% personalizado en función de tus capacidades."
            isActive
          />
          <TimelineItem
            icon={<Bell className="w-5 h-5" />}
            iconColor="bg-orange-500"
            title="En 2 días - Recordatorio"
            description="Te enviaremos un recordatorio de que tu prueba está por terminar."
          />
          <TimelineItem
            icon={<Crown className="w-5 h-5" />}
            iconColor="bg-black"
            title="En 3 días - Empieza la facturación"
            description={`Se te cobrará el ${getBillingDate()} a menos que canceles antes.`}
          />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-4">
          <PricingCard
            title="Mensual"
            price="9,99 €"
            period="/mes"
            isSelected={selectedProduct === 'monthly'}
            onClick={() => setSelectedProduct('monthly')}
          />
          <PricingCard
            title="Anual"
            price="34,99 €"
            period="/año"
            originalPrice="≈ 2,91 € / mes"
            badge="3 DÍAS GRATIS"
            isSelected={selectedProduct === 'yearly'}
            onClick={() => setSelectedProduct('yearly')}
          />
        </div>

        {/* No Payment Due */}
        <div className="flex items-center justify-center space-x-3 text-green-600">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Sin pago requerido ahora</span>
        </div>

        {/* Discount Code Section */}
        <div className="text-center">
          {!showDiscountCode ? (
            <button
              onClick={() => setShowDiscountCode(true)}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              <Tag className="w-4 h-4 mr-2" />
              ¿Tienes un código de descuento?
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Introduce tu código"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleDiscountCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
              <button
                onClick={() => setShowDiscountCode(false)}
                className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Procesando...
            </div>
          ) : (
            'Iniciar mi prueba gratuita de 3 días'
          )}
        </button>

        {/* Footer - Required Subscription Information */}
        <div className="text-center space-y-3 pb-4 px-2">
          {/* Subscription Title and Price (Required by Apple) */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              {selectedProduct === 'yearly' ? 'BeRun Premium - Suscripción Anual' : 'BeRun Premium - Suscripción Mensual'}
            </p>
            <p className="text-sm text-gray-600">
              3 días gratis, luego {selectedProduct === 'yearly' ? '34,99 € por año (2,91 €/mes)' : '9,99 € por mes'}
            </p>
            <p className="text-xs text-gray-500">
              Suscripción auto-renovable. Cancela cuando quieras.
            </p>
          </div>

          {/* Legal Links (Required by Apple) */}
          <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-xs">
            <a 
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Términos de uso (EULA)
            </a>
            <span className="text-gray-400">•</span>
            <a 
              href="https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Política de privacidad
            </a>
            <span className="text-gray-400">•</span>
            <button
              onClick={handleRestorePurchases}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 underline"
            >
              Restaurar compras
            </button>
          </div>

          {/* Subscription Terms (Required by Apple) */}
          <p className="text-[10px] leading-relaxed text-gray-500 px-4">
            El pago se cargará a tu cuenta de Apple ID al confirmar la compra. La suscripción se renueva automáticamente 
            a menos que se cancele al menos 24 horas antes del final del período de prueba. Tu cuenta se cobrará por la 
            renovación dentro de las 24 horas previas al final del período de prueba. Puedes gestionar y cancelar tus 
            suscripciones desde la configuración de tu cuenta en el App Store después de la compra.
          </p>
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  isActive?: boolean;
}> = ({ icon, iconColor, title, description, isActive = false }) => {
  return (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center">
        <div className={`${iconColor} text-white p-2 rounded-full`}>
          {icon}
        </div>
        {!isActive && (
          <div className="w-0.5 h-6 bg-gray-300 mt-2" />
        )}
      </div>
      <div className="flex-1 pb-3">
        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        <p className="text-gray-600 mt-1 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// Pricing Card Component
const PricingCard: React.FC<{
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  badge?: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ title, price, period, originalPrice, badge, isSelected, onClick }) => {
  return (
    <div className="flex flex-col items-center h-full">
      {/* Placeholder para mantener altura consistente */}
      <div className="h-7 mb-2 flex items-center justify-center">
        {badge && (
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <div 
        onClick={onClick}
        className={`w-full h-[160px] flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-black bg-gray-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-center flex-1 flex flex-col justify-center space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {price}<span className="text-base font-normal">{period}</span>
            </div>
            {/* Placeholder para mantener altura consistente */}
            <div className="h-5 mt-1">
              {originalPrice && (
                <div className="text-sm text-gray-500">{originalPrice}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pb-1">
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'border-black bg-black' 
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallPage;
