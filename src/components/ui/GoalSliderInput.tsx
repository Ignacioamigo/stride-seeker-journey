import React, { useState, useEffect, useRef, useCallback } from "react";

interface GoalSliderInputProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  placeholder: string;
  type: 'distance' | 'pace' | 'timeframe';
  label: string;
  description?: string;
}

const GoalSliderInput: React.FC<GoalSliderInputProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  placeholder,
  type,
  label,
  description
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const numValue = parseFloat(value) || min;

  // Generate visible numbers for the ruler
  const generateNumbers = () => {
    const center = Math.round(numValue);
    const numbers = [];
    for (let i = -3; i <= 3; i++) {
      const num = center + i;
      if (num >= min && num <= max) {
        numbers.push(num);
      } else {
        numbers.push(null);
      }
    }
    return numbers;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartValue(numValue);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartValue(numValue);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const sensitivity = 1; // Standard sensitivity for all types
    const deltaValue = -(deltaX * sensitivity * step) / 10;
    
    let newValue = startValue + deltaValue;
    newValue = Math.max(min, Math.min(max, newValue));
    newValue = Math.round(newValue / step) * step;
    
    onChange(newValue.toString());
  }, [isDragging, startX, startValue, step, min, max, onChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      onChange('');
      return;
    }
    
    // Only allow valid number characters and decimal point
    if (/^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleInputBlur = () => {
    // Validate and constrain value on blur
    if (value !== '') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const constrainedValue = Math.max(min, Math.min(max, num));
        const roundedValue = Math.round(constrainedValue / step) * step;
        onChange(roundedValue.toString());
      } else {
        onChange('');
      }
    }
  };

  // Format display value based on type
  const formatDisplayValue = (val: number) => {
    switch (type) {
      case 'distance':
        return `${val} km`;
      case 'pace':
        return `${val} min/km`;
      case 'timeframe':
        return val === 1 ? '1 mes' : `${val} meses`;
      default:
        return `${val} ${unit}`;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-runapp-navy mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-runapp-gray mb-3">{description}</p>
        )}
      </div>

      {/* Input field */}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full px-4 py-3 text-center text-xl font-semibold rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-runapp-purple focus:border-transparent"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-runapp-gray font-medium">
          {unit}
        </span>
      </div>

      {/* Interactive ruler */}
      <div
        ref={sliderRef}
        className="relative select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Background track */}
        <div className="h-12 bg-gray-100 rounded-lg relative overflow-hidden">
          {/* Center indicator line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-runapp-purple transform -translate-x-0.5 z-10"></div>
          
          {/* Numbers */}
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-7 gap-8 text-center">
              {generateNumbers().map((num, index) => (
                <div
                  key={index}
                  className={`text-sm font-medium transition-all duration-200 ${
                    index === 3
                      ? "text-runapp-purple font-bold text-lg scale-110"
                      : num !== null
                      ? "text-gray-400"
                      : "text-transparent"
                  }`}
                >
                  {num !== null ? num : "—"}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drag instruction */}
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            Desliza hacia la izquierda ← para ajustar o introduce manualmente
          </p>
        </div>
      </div>

      {/* Current value display */}
      <div className="text-center">
        <p className="text-sm text-runapp-purple font-medium">
          {formatDisplayValue(numValue)}
        </p>
      </div>
    </div>
  );
};

export default GoalSliderInput;
