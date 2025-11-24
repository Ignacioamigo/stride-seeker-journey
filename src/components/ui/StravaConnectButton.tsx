import React from 'react';

interface StravaConnectButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center px-4 py-3 rounded transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: '#FC5200',
        height: '48px',
        minWidth: '193px',
      }}
    >
      {/* Strava Logo */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <path 
          d="M7.5 4L2 16H5.5L7.5 11.5L9.5 16H13L7.5 4Z" 
          fill="white"
        />
        <path 
          d="M14.5 16L12 11L9.5 16H14.5Z" 
          fill="white" 
          opacity="0.7"
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
        Connect with Strava
      </span>
    </button>
  );
};

export default StravaConnectButton;


