
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RunButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'disabled';
}

const RunButton: React.FC<RunButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  disabled,
  ...props 
}) => {
  // 🔥 ESTILOS ANTI-DESCUADRE MEJORADOS
  const baseStyles = "rounded-full py-4 px-6 font-medium text-center w-full transition-colors focus:outline-none focus:ring-2 no-select relative transform-gpu will-change-auto";
  
  const variantStyles = {
    primary: "bg-runapp-purple text-white hover:bg-runapp-deep-purple focus:ring-runapp-light-purple",
    secondary: "bg-runapp-light-purple text-runapp-purple hover:bg-opacity-80 focus:ring-runapp-purple",
    outline: "bg-transparent border border-runapp-purple text-runapp-purple hover:bg-runapp-light-purple hover:bg-opacity-20 focus:ring-runapp-light-purple",
    ghost: "bg-transparent text-runapp-purple hover:bg-runapp-light-purple hover:bg-opacity-20 focus:ring-runapp-light-purple",
    disabled: "bg-gray-200 text-gray-400 cursor-not-allowed"
  };

  const variantStyle = disabled ? variantStyles.disabled : variantStyles[variant];

  return (
    <button
      className={cn(baseStyles, variantStyle, className)}
      disabled={disabled || variant === 'disabled'}
      style={{
        // 🔥 ESTABILIDAD MÁXIMA ANTI-DESCUADRE
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'auto',
        minHeight: '48px', // Altura mínima garantizada
        boxSizing: 'border-box',
      }}
      {...props}
    >
      <span 
        className="no-select"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </span>
    </button>
  );
};

export default RunButton;
