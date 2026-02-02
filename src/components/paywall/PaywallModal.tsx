import React, { useState, useEffect } from 'react';
import { X, Crown, Calendar, AlertCircle, Lock, Bell, RotateCcw } from 'lucide-react';
import { storeKitService } from '@/services/storeKitService';
import { googlePlayBillingNativeService } from '@/services/googlePlayBillingNativeService';
import { Capacitor } from '@capacitor/core';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (productId: string) => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ 
  isOpen, 
  onClose, 
  onPurchase = () => {} 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(91);

  useEffect(() => {
    if (isOpen) {
      // Animate progress bar
      setProgress(91);
      const timer = setTimeout(() => setProgress(100), 1000);
      
      // Setup listener para detectar cuando se completa una compra
      const handlePurchaseComplete = (success: boolean, productId?: string) => {
        if (success) {
          console.log('🎉 Compra detectada como completada, cerrando modal...');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Cerrar modal inmediatamente
          onClose();
          
          // Disparar evento para actualizar estado en toda la app
          window.dispatchEvent(new CustomEvent('subscription-updated', { 
            detail: { isPremium: true, productId } 
          }));
          
          // Notificar éxito después de cerrar
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
            onPurchase(productId || 'premium');
          }, 300);
        }
      };
      
      // Registrar el listener si estamos en iOS
      if (storeKitService.isAvailable()) {
        storeKitService.addPurchaseListener(handlePurchaseComplete);
      }
      
      return () => {
        clearTimeout(timer);
        // Limpiar listener al cerrar modal
        if (storeKitService.isAvailable()) {
          storeKitService.removePurchaseListener(handlePurchaseComplete);
        }
      };
    }
  }, [isOpen, onClose, onPurchase, selectedProduct]);

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      // IDs diferentes para iOS y Android (RevenueCat)
      const productId = selectedProduct === 'yearly' 
        ? (platform === 'android' ? 'berun_premium_yearly:anual-medio' : 'berun_premium_yearly')
        : (platform === 'android' ? 'berun_premium_monthly:suscripcion-mensual' : 'berun_premium_monthly');
      
      if (platform === 'ios' && storeKitService.isAvailable()) {
        console.log('🍎 Iniciando compra iOS con StoreKit...');
        const result = await storeKitService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa, actualizando estado...');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Cerrar modal inmediatamente
          onClose();
          
          // Notificar éxito después de cerrar
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
            onPurchase(productId);
            
            // Disparar evento para actualizar estado en toda la app
            window.dispatchEvent(new CustomEvent('subscription-updated', { 
              detail: { isPremium: true, productId } 
            }));
          }, 300);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          // No mostrar error si el usuario canceló
        } else {
          alert(`Error en la compra: ${result.error || 'Por favor, inténtalo de nuevo.'}`);
        }
      } else if (platform === 'android' && googlePlayBillingNativeService.isAvailable()) {
        console.log('🤖 Iniciando compra Android con Google Play...');
        const result = await googlePlayBillingNativeService.purchase(productId);
        
        if (result.success) {
          console.log('✅ Compra exitosa, actualizando estado...');
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          
          // Cerrar modal inmediatamente
          onClose();
          
          // Notificar éxito después de cerrar
          setTimeout(() => {
            alert('✅ ¡Suscripción activada!\nDisfruta de tu prueba gratuita de 3 días.');
            onPurchase(productId);
            
            // Disparar evento para actualizar estado en toda la app
            window.dispatchEvent(new CustomEvent('subscription-updated', { 
              detail: { isPremium: true, productId } 
            }));
          }, 300);
        } else if (result.reason === 'cancelled') {
          console.log('ℹ️ Usuario canceló la compra');
          // No mostrar error si el usuario canceló
        } else {
          alert(`Error en la compra: ${result.error || 'Por favor, inténtalo de nuevo.'}`);
        }
      } else {
        // Fallback para web/desarrollo - simulación
        console.log('🌐 Modo web - Simulando compra...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        onClose();
        setTimeout(() => {
          onPurchase(productId);
        }, 300);
      }
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('Hubo un error al procesar la compra. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
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
          onPurchase('restored');
          onClose();
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
          onPurchase('restored');
          onClose();
        } else {
          alert('No se encontraron compras previas para restaurar.');
        }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => {
              // Simulate restore
              console.log('Restore purchases');
            }}
            className="text-blue-600 font-medium"
          >
            Restore
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Section */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-gray-900">
              {progress}%
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
              Estamos configurando<br />todo para ti
            </h1>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-gray-600">
              Finalizando resultados...
            </p>
          </div>

          {/* Main Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              Inicia tu prueba GRATUITA<br />de 3 días para continuar.
            </h2>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <TimelineItem
              icon={<Lock className="w-4 h-4" />}
              iconColor="bg-orange-500"
              title="Hoy"
              description="Desbloquea tu entrenamiento 100% personalizado en función de tus capacidades."
              isActive
            />
            <TimelineItem
              icon={<Bell className="w-4 h-4" />}
              iconColor="bg-orange-500"
              title="En 2 días - Recordatorio"
              description="Te enviaremos un recordatorio de que tu prueba está por terminar."
            />
            <TimelineItem
              icon={<Crown className="w-4 h-4" />}
              iconColor="bg-black"
              title="En 3 días - Empieza la facturación"
              description={`Se te cobrará el ${getBillingDate()} a menos que canceles antes.`}
            />
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-2 gap-3">
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
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold">Sin pago requerido ahora</span>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Procesando...
              </div>
            ) : (
              'Iniciar mi prueba gratuita de 3 días'
            )}
          </button>

          {/* Footer - Required Subscription Information */}
          <div className="text-center space-y-3">
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
            <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-2 text-xs">
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
            <p className="text-[10px] leading-relaxed text-gray-500 px-2">
              El pago se cargará a tu cuenta de Apple ID al confirmar la compra. La suscripción se renueva automáticamente 
              a menos que se cancele al menos 24 horas antes del final del período de prueba. Tu cuenta se cobrará por la 
              renovación dentro de las 24 horas previas al final del período de prueba. Puedes gestionar y cancelar tus 
              suscripciones desde la configuración de tu cuenta en el App Store después de la compra.
            </p>
          </div>
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
    <div className="flex space-x-3">
      <div className="flex flex-col items-center">
        <div className={`${iconColor} text-white p-2 rounded-full`}>
          {icon}
        </div>
        {!isActive && (
          <div className="w-0.5 h-8 bg-gray-300 mt-2" />
        )}
      </div>
      <div className="flex-1 pb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
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
      <div className="h-6 mb-2 flex items-center justify-center">
        {badge && (
          <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <div 
        onClick={onClick}
        className={`w-full h-[140px] flex flex-col justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-black bg-gray-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-center flex-1 flex flex-col justify-center space-y-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {price}<span className="text-sm font-normal">{period}</span>
            </div>
            {/* Placeholder para mantener altura consistente */}
            <div className="h-4 mt-1">
              {originalPrice && (
                <div className="text-xs text-gray-500">{originalPrice}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pb-1">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'border-black bg-black' 
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
