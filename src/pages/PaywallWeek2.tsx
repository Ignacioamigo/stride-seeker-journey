import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, TrendingUp, Target, Zap } from 'lucide-react';
import { googlePlayBillingNativeService } from '../services/googlePlayBillingNativeService';
import { storeKitService } from '../services/storeKitService';
import { Capacitor } from '@capacitor/core';

const PaywallWeek2: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      const productId = selectedProduct === 'yearly' 
        ? 'berun_premium_yearly' 
        : 'berun_premium_monthly';
      
      if (platform === 'ios' && Capacitor.isNativePlatform()) {
        console.log('🍎 Iniciando compra iOS con StoreKit...');
        const result = await storeKitService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Eliminar la flag de Semana 1 gratis
          localStorage.removeItem('freeWeek1Active');
          
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          navigate('/plan');
          
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          setIsLoading(false);
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
          
          localStorage.removeItem('freeWeek1Active');
          
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          navigate('/plan');
          
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
          }, 500);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          setIsLoading(false);
        } else if (result.error) {
          alert(`Error: ${result.error}`);
          setIsLoading(false);
        }
      } else {
        // Web/fallback - solo para desarrollo
        console.log('🌐 Modo web - Simulando compra');
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        
        localStorage.removeItem('freeWeek1Active');
        
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

  const handleDiscountCode = () => {
    if (discountCode.trim() === 'BeRun2025.gratiss') {
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('subscriptionType', 'discount');
      localStorage.setItem('trialStartDate', new Date().toISOString());
      localStorage.removeItem('freeWeek1Active');
      navigate('/plan');
    } else {
      alert('Código de descuento inválido');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'ios' && storeKitService.isAvailable()) {
        const result = await storeKitService.restore();
        if (result.success && result.count > 0) {
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', 'restored');
          localStorage.removeItem('freeWeek1Active');
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
          localStorage.removeItem('freeWeek1Active');
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <button
          onClick={() => navigate('/plan')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <Crown className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="flex-1 px-6 pt-8 pb-4 space-y-6 overflow-y-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Suscríbete para desbloquear tu evolución semanal
          </h1>
          <p className="text-lg text-gray-600">
            Has demostrado tu compromiso. Ahora llega a tu objetivo con planes personalizados cada semana.
          </p>
        </div>

        {/* Beneficios */}
        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="bg-blue-600 rounded-full p-2 mt-1">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Planes adaptativos semanales
              </h3>
              <p className="text-sm text-gray-600">
                Cada semana analizamos tu progreso y ajustamos tu plan para optimizar resultados.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
            <div className="bg-green-600 rounded-full p-2 mt-1">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Seguimiento personalizado
              </h3>
              <p className="text-sm text-gray-600">
                Análisis detallado de tu rendimiento, ritmo, resistencia y áreas de mejora.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
            <div className="bg-orange-600 rounded-full p-2 mt-1">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Progreso garantizado
              </h3>
              <p className="text-sm text-gray-600">
                Metodología probada que te lleva del punto A al B de forma segura y efectiva.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-2 gap-4 pt-4">
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
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              AHORRA 70%
            </div>
            <div className="text-sm font-semibold text-gray-900">Anual</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">34,99 €</div>
            <div className="text-xs text-gray-500">≈ 2,91 € / mes</div>
          </button>
        </div>

        {/* Trial Info */}
        <div className="flex items-center justify-center space-x-3 text-green-600 bg-green-50 p-3 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Prueba gratuita de 3 días incluida</span>
        </div>

        {/* Discount Code Section */}
        <div className="text-center">
          {!showDiscountCode ? (
            <button
              onClick={() => setShowDiscountCode(true)}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
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
          className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg disabled:opacity-50 hover:bg-gray-900 transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Procesando...
            </div>
          ) : (
            'Desbloquear mi evolución'
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
            El pago se cargará a tu cuenta al confirmar la compra. La suscripción se renueva automáticamente 
            a menos que se cancele al menos 24 horas antes del final del período de prueba. Tu cuenta se cobrará por la 
            renovación dentro de las 24 horas previas al final del período de prueba. Puedes gestionar y cancelar tus 
            suscripciones desde la configuración de tu cuenta después de la compra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallWeek2;



