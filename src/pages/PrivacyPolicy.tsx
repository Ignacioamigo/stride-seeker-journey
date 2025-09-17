import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { useLayoutStability } from '@/hooks/useLayoutStability';

const HEADER_HEIGHT = 64;

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  useLayoutStability();

  return (
    <div 
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb'
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 bg-white shadow-sm fixed top-0 left-0 right-0 z-50"
        style={{
          paddingTop: `max(${insets.top}px + 20px, env(safe-area-inset-top, 20px) + 20px)`
        }}
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-runapp-navy">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver
          </Button>
          <h1 className="text-lg font-semibold text-runapp-navy">Política de Privacidad</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: `calc(${HEADER_HEIGHT}px + max(${insets.top}px, env(safe-area-inset-top, 20px)) + 20px)`,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          paddingBottom: 16,
        }}
      >
        <div className="w-full max-w-md mx-auto px-4">
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-runapp-navy mb-4">Política de Privacidad de Stride Seeker</h2>
              <p className="text-sm text-gray-600 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
              
              <div className="space-y-6 text-sm">
                
                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">1. Responsable del Tratamiento</h3>
                  <p className="text-gray-700 mb-2">
                    Stride Seeker es una aplicación de running que procesa datos personales de conformidad con el 
                    Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y 
                    Garantía de los Derechos Digitales (LOPDGDD) de España.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">2. Datos que Recopilamos</h3>
                  <div className="text-gray-700 space-y-2">
                    <p><strong>Datos de Registro:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Nombre y apellidos</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Edad y datos físicos (altura, peso)</li>
                    </ul>
                    
                    <p><strong>Datos de Actividad:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Datos de GPS y ubicación durante entrenamientos</li>
                      <li>Métricas de rendimiento (distancia, tiempo, ritmo)</li>
                      <li>Historial de entrenamientos</li>
                    </ul>
                    
                    <p><strong>Datos Técnicos:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Información del dispositivo</li>
                      <li>Datos de uso de la aplicación</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">3. Finalidad del Tratamiento</h3>
                  <div className="text-gray-700">
                    <p>Utilizamos tus datos para:</p>
                    <ul className="list-disc ml-4 space-y-1 mt-2">
                      <li>Proporcionar servicios de seguimiento de running</li>
                      <li>Personalizar planes de entrenamiento</li>
                      <li>Mostrar estadísticas y progreso</li>
                      <li>Mejorar la funcionalidad de la aplicación</li>
                      <li>Cumplir con obligaciones legales</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">4. Base Legal</h3>
                  <p className="text-gray-700">
                    El tratamiento de tus datos se basa en tu consentimiento explícito, el cumplimiento de 
                    obligaciones contractuales y nuestro interés legítimo en mejorar nuestros servicios.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">5. Conservación de Datos</h3>
                  <p className="text-gray-700">
                    Conservamos tus datos personales durante el tiempo necesario para cumplir con las 
                    finalidades descritas, o según lo requiera la legislación española aplicable.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">6. Compartir Datos</h3>
                  <p className="text-gray-700">
                    No vendemos ni compartimos tus datos personales con terceros, excepto cuando sea 
                    necesario para proporcionar nuestros servicios (proveedores de servicios en la nube) 
                    o cuando lo requiera la ley.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">7. Tus Derechos (RGPD)</h3>
                  <div className="text-gray-700">
                    <p>Tienes derecho a:</p>
                    <ul className="list-disc ml-4 space-y-1 mt-2">
                      <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                      <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                      <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                      <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                      <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
                      <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">8. Datos de Localización</h3>
                  <p className="text-gray-700">
                    La aplicación utiliza GPS para rastrear tus entrenamientos. Puedes desactivar la 
                    localización en cualquier momento desde la configuración de tu dispositivo, aunque 
                    esto limitará algunas funcionalidades de la app.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">9. Seguridad</h3>
                  <p className="text-gray-700">
                    Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos 
                    personales contra el acceso no autorizado, alteración, divulgación o destrucción.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">10. Menores de Edad</h3>
                  <p className="text-gray-700">
                    Nuestra aplicación no está dirigida a menores de 16 años. No recopilamos 
                    intencionalmente datos personales de menores de 16 años.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">11. Contacto y Ejercicio de Derechos</h3>
                  <p className="text-gray-700 mb-2">
                    Para ejercer tus derechos o realizar consultas sobre esta política de privacidad, 
                    puedes contactarnos a través de la configuración de la aplicación.
                  </p>
                  <p className="text-gray-700">
                    También tienes derecho a presentar una reclamación ante la Agencia Española de 
                    Protección de Datos (AEPD) si consideras que el tratamiento de tus datos no se 
                    ajusta a la normativa vigente.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">12. Cambios en la Política</h3>
                  <p className="text-gray-700">
                    Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
                    de cualquier cambio importante a través de la aplicación.
                  </p>
                </section>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
