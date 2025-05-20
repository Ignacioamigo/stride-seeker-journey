
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
  const baseStyles = "rounded-full py-4 px-6 font-medium text-center w-full transition-colors focus:outline-none focus:ring-2";
  
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
      {...props}
    >
      {children}
    </button>
  );
};

export default RunButton;
