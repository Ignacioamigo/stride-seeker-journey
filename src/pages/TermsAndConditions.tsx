import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSafeAreaInsets } from '@/hooks/utils/useSafeAreaInsets';
import { useLayoutStability } from '@/hooks/useLayoutStability';

const HEADER_HEIGHT = 64;

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  useLayoutStability();

  const handleRedirectToApple = () => {
    // Abrir en una nueva ventana/tab
    window.open('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', '_blank');
  };

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
          <h1 className="text-lg font-semibold text-runapp-navy">Términos y Condiciones</h1>
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
              <h2 className="text-xl font-bold text-runapp-navy mb-4">Términos y Condiciones</h2>
              
              <div className="space-y-4 text-sm">
                
                <section>
                  <p className="text-gray-700 mb-4">
                    Stride Seeker es una aplicación disponible a través del App Store de Apple. 
                    Al descargar y usar esta aplicación, aceptas los términos y condiciones 
                    establecidos por Apple para todas las aplicaciones distribuidas a través de su plataforma.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">Licencia de la Aplicación</h3>
                  <p className="text-gray-700 mb-4">
                    Esta aplicación está sujeta al Acuerdo de Licencia de Usuario Final (EULA) 
                    estándar de Apple para aplicaciones con licencia. Este acuerdo rige tu uso 
                    de la aplicación y establece tus derechos y responsabilidades como usuario.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">Términos Aplicables</h3>
                  <p className="text-gray-700 mb-4">
                    Los términos y condiciones completos que rigen el uso de esta aplicación 
                    están disponibles en el sitio web oficial de Apple. Estos términos incluyen 
                    información sobre:
                  </p>
                  <ul className="list-disc ml-4 space-y-1 text-gray-700 mb-4">
                    <li>Alcance de la licencia de uso</li>
                    <li>Restricciones de uso</li>
                    <li>Recopilación y uso de datos</li>
                    <li>Servicios externos</li>
                    <li>Limitaciones de garantía</li>
                    <li>Limitación de responsabilidad</li>
                    <li>Ley aplicable y jurisdicción</li>
                  </ul>
                </section>

                <section className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-runapp-navy mb-3 flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Consultar Términos Completos
                  </h3>
                  <p className="text-gray-700 mb-4 text-xs">
                    Para consultar los términos y condiciones completos que rigen el uso de esta aplicación, 
                    haz clic en el siguiente botón para acceder al Acuerdo de Licencia de Usuario Final 
                    de Apple:
                  </p>
                  <Button 
                    onClick={handleRedirectToApple}
                    className="w-full bg-runapp-purple hover:bg-runapp-deep-purple text-white font-medium py-3"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Términos Completos en Apple
                  </Button>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">Términos Específicos de Stride Seeker</h3>
                  <div className="text-gray-700 space-y-3">
                    <p>
                      <strong>Uso de GPS:</strong> La aplicación utiliza servicios de localización 
                      para rastrear tus entrenamientos. El uso de GPS puede consumir batería adicional.
                    </p>
                    <p>
                      <strong>Datos de Salud:</strong> La aplicación procesa datos relacionados con 
                      tu actividad física. Consulta nuestra Política de Privacidad para más información.
                    </p>
                    <p>
                      <strong>Uso Responsable:</strong> Utiliza la aplicación de manera segura y 
                      responsable durante tus entrenamientos. Mantente atento a tu entorno.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-runapp-navy mb-2">Contacto</h3>
                  <p className="text-gray-700">
                    Si tienes preguntas sobre estos términos, puedes contactarnos a través de 
                    la configuración de la aplicación.
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

export default TermsAndConditions;
