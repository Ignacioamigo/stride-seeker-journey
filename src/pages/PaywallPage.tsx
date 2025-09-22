import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Calendar, Bell, Lock } from 'lucide-react';

const PaywallPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<'monthly' | 'yearly'>('yearly');
  const [progress, setProgress] = useState(91);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Animate progress to 100%
    const timer = setTimeout(() => setProgress(100), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // Check if running on native platform
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        console.log('🍎 Using native StoreKit with Configuration.storekit');
        
        // For production: StoreKit Configuration handles everything
        // This will trigger the native purchase flow with your configured products
        console.log('💳 Triggering native purchase flow...');
        
        // TODO: Implement real StoreKit purchase flow here
        // For now, we're using Configuration.storekit for testing
        
        try {
          // This should trigger the real StoreKit sheet in production
          console.log('🍎 Should show real StoreKit sheet with real Apple Pay');
          
          // Temporary: simulate success for development
          alert(`🎉 Compra sandbox completada para plan ${selectedProduct}\n\n✅ En producción: Sheet real de Apple Pay\n✅ Trial de 3 días gratis funcionando`);
          
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionType', selectedProduct);
          localStorage.setItem('trialStartDate', new Date().toISOString());
          navigate('/plan');
        } catch (error) {
          console.error('Purchase error:', error);
          alert('Error en la compra. Inténtalo de nuevo.');
        }
      } else {
        // Fallback for web/simulator
        console.log('🌐 Using web fallback (web platform)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`📱 En dispositivo real aparecería Apple Pay/Touch ID\n\n¡Bienvenido a Premium! Plan ${selectedProduct === 'yearly' ? 'anual' : 'mensual'} activado.`);
        
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('subscriptionType', selectedProduct);
        localStorage.setItem('trialStartDate', new Date().toISOString());
        navigate('/plan');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert(`Error en la compra: ${error.message || 'Error desconocido'}`);
    }
    
    setIsLoading(false);
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
            price="2,91 €"
            period="/mes"
            originalPrice="34,99 € por año"
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

        {/* Footer */}
        <div className="text-center space-y-2 pb-4">
          <p className="text-sm text-gray-600">
            3 días gratis, luego {selectedProduct === 'yearly' ? '34,99 € por año (2,91 €/mes)' : '9,99 € por mes'}
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-blue-600">Términos de servicio</a>
            <a href="#" className="text-blue-600">Política de privacidad</a>
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
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-black bg-gray-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-black text-white text-xs font-bold px-4 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}
      
      <div className="text-center space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {price}<span className="text-base font-normal">{period}</span>
          </div>
          {originalPrice && (
            <div className="text-sm text-gray-500 mt-1">{originalPrice}</div>
          )}
        </div>
        
        <div className="flex justify-center pt-2">
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
