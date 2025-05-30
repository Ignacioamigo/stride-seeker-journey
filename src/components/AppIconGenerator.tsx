
import React from 'react';
import { Activity } from 'lucide-react';

// Este componente genera el ícono de la app para usar en el diseño
// Para los assets reales de iOS, necesitarás exportar como PNG en las dimensiones correctas

const AppIconDesign: React.FC<{ size?: number }> = ({ size = 1024 }) => {
  return (
    <div 
      style={{
        width: size,
        height: size,
        backgroundColor: '#4C1D95', // runapp-purple
        borderRadius: size * 0.2, // iOS icon corner radius ~20%
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Activity 
        size={size * 0.6} 
        color="white" 
        strokeWidth={size * 0.01}
      />
    </div>
  );
};

export default AppIconDesign;

// Dimensiones necesarias para iOS:
// 20pt (20x20, 40x40, 60x60)
// 29pt (29x29, 58x58, 87x87) 
// 40pt (40x40, 80x80, 120x120)
// 60pt (60x60, 120x120, 180x180)
// 76pt (76x76, 152x152)
// 83.5pt (167x167)
// 1024pt (1024x1024) - App Store
