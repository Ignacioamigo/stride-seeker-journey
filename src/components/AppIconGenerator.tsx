
import React from 'react';

// Este componente muestra el ícono real de BeRun
// Usa el archivo PNG real del logo

const AppIconDesign: React.FC<{ size?: number }> = ({ size = 1024 }) => {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2, // iOS icon corner radius ~20%
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img 
        src="/BeRun_appicon_1024_blue1463FF.png"
        alt="BeRun App Icon"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
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
