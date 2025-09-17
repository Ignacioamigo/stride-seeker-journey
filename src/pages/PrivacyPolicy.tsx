import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Shield, MapPin, Heart, Smartphone, Database, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { useLayoutStability } from '@/hooks/useLayoutStability';

const HEADER_HEIGHT = 44;

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  
  // 🔥 HOOK ANTI-DESCUADRE
  useLayoutStability();
  const { top, bottom, left, right, isReady } = useSafeAreaInsets();

  // Usar fallbacks seguros cuando isReady es false
  const safeTop = isReady ? (top || 0) : 44;
  const safeBottom = isReady ? (bottom || 0) : 34;
  const safeLeft = isReady ? left : 0;
  const safeRight = isReady ? right : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header estándar */}
      <Header title="Política de Privacidad" subtitle="Cómo protegemos tus datos" />
      
      {/* Content area */}
      <div 
        className="w-full flex justify-center"
        style={{ 
          paddingTop: safeTop + HEADER_HEIGHT + 16,
          paddingBottom: `calc(200px + ${safeBottom}px)`,
          paddingLeft: Math.max(safeLeft, 16),
          paddingRight: Math.max(safeRight, 16),
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div className="w-full max-w-md mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4 text-runapp-navy"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al perfil
          </Button>

          {/* Privacy Hero Card */}
          <Card className="mb-6 bg-gradient-to-br from-green-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-white" />
              <h2 className="text-xl font-bold mb-2">Tu privacidad es importante</h2>
              <p className="text-sm text-white/90">Cumplimos con el RGPD y la normativa española de protección de datos</p>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-4">
            {/* Información que recopilamos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Database className="w-6 h-6 text-runapp-purple mt-1" />
                  <div>
                    <h3 className="font-semibold text-runapp-navy mb-2">¿Qué información recopilamos?</h3>
                    <div className="text-sm text-runapp-gray space-y-2">
                      <p>• <strong>Datos de perfil:</strong> Nombre, edad, peso, altura que tú nos proporcionas</p>
                      <p>• <strong>Datos de entrenamiento:</strong> Distancias, tiempos, rutas GPS de tus carreras</p>
                      <p>• <strong>Datos técnicos:</strong> Tipo de dispositivo, versión de la app, rendimiento</p>
                      <p>• <strong>Integraciones:</strong> Datos de Strava si decides conectar tu cuenta</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cómo usamos los datos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Heart className="w-6 h-6 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-runapp-navy mb-2">¿Cómo usamos tus datos?</h3>
                    <div className="text-sm text-runapp-gray space-y-2">
                      <p>• <strong>Personalización:</strong> Crear planes de entrenamiento adaptados a ti</p>
                      <p>• <strong>Seguimiento:</strong> Mostrar tu progreso y estadísticas de running</p>
                      <p>• <strong>Mejoras:</strong> Optimizar la app y añadir nuevas funcionalidades</p>
                      <p>• <strong>Soporte:</strong> Ayudarte con problemas técnicos cuando sea necesario</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de ubicación */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-runapp-navy mb-2">Datos de ubicación GPS</h3>
                    <div className="text-sm text-runapp-gray space-y-2">
                      <p>• Solo se recopilan durante tus entrenamientos activos</p>
                      <p>• Se almacenan localmente en tu dispositivo</p>
                      <p>• Puedes eliminar rutas GPS desde la app cuando quieras</p>
                      <p>• No compartimos tu ubicación con terceros sin tu consentimiento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compartir datos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Users className="w-6 h-6 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-runapp-navy mb-2">¿Compartimos tus datos?</h3>
                    <div className="text-sm text-runapp-gray space-y-2">
                      <p>• <strong>No vendemos</strong> tus datos personales a terceros</p>
                      <p>• <strong>Strava:</strong> Solo si conectas tu cuenta voluntariamente</p>
                      <p>• <strong>Servicios técnicos:</strong> Proveedores que nos ayudan a mantener la app</p>
                      <p>• <strong>Cumplimiento legal:</strong> Solo si es requerido por ley española</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tus derechos RGPD */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Tus derechos (RGPD)</h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p>• <strong>Acceso:</strong> Ver qué datos tenemos sobre ti</p>
                      <p>• <strong>Rectificación:</strong> Corregir datos incorrectos</p>
                      <p>• <strong>Eliminación:</strong> Solicitar el borrado de tus datos</p>
                      <p>• <strong>Portabilidad:</strong> Obtener una copia de tus datos</p>
                      <p>• <strong>Oposición:</strong> Oponerte al procesamiento de tus datos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Smartphone className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-runapp-navy mb-2">Seguridad de tus datos</h3>
                    <div className="text-sm text-runapp-gray space-y-2">
                      <p>• <strong>Cifrado:</strong> Todos los datos se transmiten de forma segura</p>
                      <p>• <strong>Almacenamiento local:</strong> La mayoría de datos se guardan en tu dispositivo</p>
                      <p>• <strong>Acceso limitado:</strong> Solo personal autorizado puede acceder a datos</p>
                      <p>• <strong>Actualizaciones:</strong> Mantenemos medidas de seguridad actualizadas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-800 mb-3">¿Tienes dudas sobre tu privacidad?</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Si tienes preguntas sobre esta política de privacidad o quieres ejercer tus derechos RGPD, contacta con nosotros:
                </p>
                <div className="text-sm text-purple-700 space-y-1">
                  <p>📧 Email: privacy@strideseeker.app</p>
                  <p>📍 Dirección: España (conforme a normativa española)</p>
                  <p>⏰ Responderemos en un plazo máximo de 30 días</p>
                </div>
              </CardContent>
            </Card>

            {/* Footer legal */}
            <Card className="bg-gray-100">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 text-center">
                  Esta política de privacidad cumple con el Reglamento General de Protección de Datos (RGPD) 
                  y la Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) de España.
                  <br/><br/>
                  Última actualización: Septiembre 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
