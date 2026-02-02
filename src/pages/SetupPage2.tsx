import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googlePlayBillingNativeService } from '../services/googlePlayBillingNativeService';
import { storeKitService } from '../services/storeKitService';
import { Capacitor } from '@capacitor/core';

const SetupPage2: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleStartTrial = async () => {
    // 🎁 NUEVO FLUJO: Semana 1 GRATIS - Saltar paywall
    console.log('🎁 Usuario iniciando Semana 1 GRATIS - sin paywall');
    
    // Marcar que el usuario está en período de prueba gratuita (Semana 1)
    localStorage.setItem('freeWeek1Active', 'true');
    localStorage.setItem('week1StartDate', new Date().toISOString());
    
    // Navegar directamente al plan sin mostrar paywall
    navigate('/plan');
  };

  const handlePurchase = async (selectedProduct: 'monthly' | 'yearly') => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      // IDs diferentes para iOS y Android (RevenueCat)
      const productId = selectedProduct === 'yearly' 
        ? (platform === 'android' ? 'berun_premium_yearly:anual-medio' : 'berun_premium_yearly')
        : (platform === 'android' ? 'berun_premium_monthly:suscripcion-mensual' : 'berun_premium_monthly');
      
      if (platform === 'ios' && Capacitor.isNativePlatform()) {
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
          
          // Navegar a la app SOLO si la compra fue exitosa
          navigate('/plan');
          
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra - permaneciendo en setup');
          setIsLoading(false);
          // NO navegar - el usuario debe completar la compra
        } else if (result.error) {
          alert(`Error: ${result.error}`);
          setIsLoading(false);
        }
      } else if (platform === 'android' && googlePlayBillingNativeService.isAvailable()) {
        console.log('🤖 Iniciando compra Android con Google Play...');
        const result = await googlePlayBillingNativeService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa en Android');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          // Navegar a la app SOLO si la compra fue exitosa
          navigate('/plan');
          
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra - permaneciendo en setup');
          setIsLoading(false);
        } else if (result.error) {
          alert(`Error: ${result.error}`);
          setIsLoading(false);
        }
      } else {
        // Web/fallback - solo para desarrollo
        console.log('⚠️ Modo web - simulando compra');
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        
        window.dispatchEvent(new CustomEvent('subscription-updated', { 
          detail: { isPremium: true, productId } 
        }));
        
        navigate('/plan');
      }
    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
      alert('Ocurrió un error. Por favor, inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  // Si no está mostrando el paywall, mostrar la pantalla de "plan listo"
  if (!showPaywall) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6" style={{ paddingTop: '60px' }}>
        <div className="text-center space-y-8 max-w-md mx-auto">
          
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Felicidades tu plan<br />personalizado está listo
          </h1>
          
          {/* Goal Achievement */}
          <div className="bg-green-50 rounded-2xl p-6 space-y-4 border-2 border-green-200">
            <p className="text-lg text-gray-700 text-center">
              Hemos diseñado la estructura de tu plan adaptándonos a tu objetivo.
            </p>
          </div>
          
          {/* Plan Features */}
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Tu plan incluye:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-800">Entrenamientos personalizados</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-800">Seguimiento de progreso</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-800">Recomendaciones nutricionales</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-800">Análisis de rendimiento</span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleStartTrial}
            className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg mt-8"
          >
            Acceder a mi Plan Personalizado
          </button>
          
        </div>
      </div>
    );
  }

  // Si showPaywall es true, mostrar el paywall integrado
  return <PaywallIntegrated onPurchase={handlePurchase} isLoading={isLoading} />;
};

// Componente PaywallIntegrated dentro del mismo archivo
const PaywallIntegrated: React.FC<{ onPurchase: (product: 'monthly' | 'yearly') => void; isLoading: boolean }> = ({ onPurchase, isLoading }) => {
  const [selectedProduct, setSelectedProduct] = useState<'monthly' | 'yearly'>('yearly');
  const [progress, setProgress] = useState(91);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRestorePurchases = async () => {
    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'ios' && storeKitService.isAvailable()) {
        const result = await storeKitService.restore();
        if (result.success && result.count > 0) {
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', 'restored');
          alert(`✅ Compras restauradas exitosamente!\n${result.count} compra(s) encontrada(s).`);
          navigate('/plan');
        } else {
          alert('No se encontraron compras previas para restaurar.');
        }
      } else if (platform === 'android' && googlePlayBillingNativeService.isAvailable()) {
        const result = await googlePlayBillingNativeService.restore();
        if (result.success) {
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', 'restored');
          alert('✅ Compras restauradas exitosamente!');
          navigate('/plan');
        } else {
          alert('No se encontraron compras previas para restaurar.');
        }
      } else {
        alert('La restauración de compras solo está disponible en dispositivos móviles.');
      }
    } catch (error) {
      console.error('Error restaurando compras:', error);
      alert('Hubo un error al restaurar las compras. Por favor, inténtalo de nuevo.');
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
      <div className="flex-1 px-6 pt-8 pb-4 space-y-4 overflow-y-auto">
        
        {/* Progress Section */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-gray-900">
            {progress}%
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
            Estamos configurando<br />todo para ti
          </h1>
          
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedProduct('monthly')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedProduct === 'monthly' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="text-sm font-semibold text-gray-900">Mensual</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">9,99 €</div>
            <div className="text-xs text-gray-500">/mes</div>
          </button>
          
          <button
            onClick={() => setSelectedProduct('yearly')}
            className={`p-4 rounded-xl border-2 transition-all relative ${
              selectedProduct === 'yearly' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              3 DÍAS GRATIS
            </div>
            <div className="text-sm font-semibold text-gray-900">Anual</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">34,99 €</div>
            <div className="text-xs text-gray-500">≈ 2,91 € / mes</div>
          </button>
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

        {/* CTA Button */}
        <button
          onClick={() => onPurchase(selectedProduct)}
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

        {/* Footer */}
        <div className="text-center space-y-3 pb-4 px-2">
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

export default SetupPage2;
