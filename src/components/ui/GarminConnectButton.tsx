import React from 'react';

interface GarminConnectButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const GarminConnectButton: React.FC<GarminConnectButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center px-4 py-3 rounded transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: '#007CC3', // Garmin blue color
        height: '48px',
        minWidth: '193px',
      }}
    >
      {/* Garmin Logo */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Simplified Garmin triangle logo */}
        <path 
          d="M12 2L2 20H22L12 2Z" 
          fill="white"
        />
        <path 
          d="M12 8L8 16H16L12 8Z" 
          fill="#007CC3"
        />
      </svg>
      
      {/* Button Text */}
      <span 
        style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          letterSpacing: '0.3px',
        }}
      >
        Connect with Garmin
      </span>
    </button>
  );
};

export default GarminConnectButton;




