import React, { useState, useEffect } from 'react';
import { X, Crown, Calendar, AlertCircle, Lock, Bell } from 'lucide-react';

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
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    setIsLoading(true);
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPurchase(selectedProduct === 'yearly' ? 'stride_seeker_premium_yearly' : 'stride_seeker_premium_monthly');
    setIsLoading(false);
    onClose();
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
              price="2,91 €"
              period="/mes"
              originalPrice="34,99 € por año"
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

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              3 días gratis, luego {selectedProduct === 'yearly' ? '34,99 € por año (2,91 €/mes)' : '9,99 € por mes'}
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="#" className="text-blue-600">Términos de servicio</a>
              <a href="#" className="text-blue-600">Política de privacidad</a>
            </div>
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
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-black bg-gray-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {badge && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}
      
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {price}<span className="text-sm font-normal">{period}</span>
          </div>
          {originalPrice && (
            <div className="text-xs text-gray-500">{originalPrice}</div>
          )}
        </div>
        
        <div className="flex justify-center">
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
