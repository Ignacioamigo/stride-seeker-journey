import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Browser } from '@capacitor/browser';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const openPrivacyPolicy = async () => {
      try {
        await Browser.open({ 
          url: 'https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394?pvs=74',
          presentationStyle: 'popover'
        });
        // Volver a la página anterior después de abrir el navegador
        navigate(-1);
      } catch (error) {
        console.error('Error opening browser:', error);
        // Si falla, intenta con window.open como fallback
        window.open('https://wild-freon-354.notion.site/BeRun-Politica-de-privacidad-27aa985ca317809ebb86decee420e394?pvs=74', '_blank');
        navigate(-1);
      }
    };

    openPrivacyPolicy();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Abriendo Política de Privacidad...</p>
    </div>
  );
};

export default PrivacyPolicy;
