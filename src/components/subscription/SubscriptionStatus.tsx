import React from 'react';
import { useSubscription } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Calendar, AlertCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  showPaywallButton?: boolean;
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  showPaywallButton = true, 
  className = "" 
}) => {
  const { 
    status, 
    isPremium, 
    isInFreeTrial, 
    trialDaysRemaining, 
    showPaywall,
    refreshStatus 
  } = useSubscription();

  const getStatusBadge = () => {
    if (!status) return null;

    switch (status.status) {
      case 'free_trial':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Prueba gratuita ({trialDaysRemaining} días restantes)
          </Badge>
        );
      case 'subscribed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Crown className="w-3 h-3 mr-1" />
            Premium Activo
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suscripción Expirada
          </Badge>
        );
      case 'not_subscribed':
      default:
        return (
          <Badge variant="outline">
            Sin suscripción
          </Badge>
        );
    }
  };

  const getStatusMessage = () => {
    if (!status) return "Verificando estado de suscripción...";

    switch (status.status) {
      case 'free_trial':
        return `Disfruta de todas las funciones premium durante tu prueba gratuita. Te quedan ${trialDaysRemaining} días.`;
      case 'subscribed':
        return "Tienes acceso completo a todas las funciones premium de Stride Seeker.";
      case 'expired':
        return "Tu suscripción ha expirado. Renueva para seguir disfrutando de las funciones premium.";
      case 'not_subscribed':
      default:
        return "Actualiza a premium para acceder a planes personalizados, análisis avanzados y más funciones.";
    }
  };

  const getActionButton = () => {
    if (!showPaywallButton) return null;

    if (isPremium) {
      return (
        <Button variant="outline" onClick={refreshStatus}>
          Actualizar estado
        </Button>
      );
    }

    return (
      <Button onClick={showPaywall} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        <Crown className="w-4 h-4 mr-2" />
        Actualizar a Premium
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Estado de Suscripción</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {getStatusMessage()}
        </CardDescription>
        
        {isPremium && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center text-green-800">
              <Crown className="w-4 h-4 mr-2" />
              <span className="font-medium">Funciones Premium Activas:</span>
            </div>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• Planes de entrenamiento personalizados</li>
              <li>• Análisis avanzados de rendimiento</li>
              <li>• Entrenamientos ilimitados</li>
              <li>• Exportación de datos</li>
              <li>• Coaching con IA</li>
            </ul>
          </div>
        )}
        
        {getActionButton()}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
