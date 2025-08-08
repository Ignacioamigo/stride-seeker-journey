import React from 'react';
import { WeekDay } from '@/types';
import { getDateLabel } from '@/utils/dateUtils';

interface DaySelectorProps {
  days: WeekDay[];
  onDayToggle: (dayId: number) => void;
  maxSelections?: number;
  minSelections?: number;
  className?: string;
}

/**
 * Componente para seleccionar días de la semana con fechas reales
 */
const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  onDayToggle,
  maxSelections = 7,
  minSelections = 1,
  className = ''
}) => {
  const selectedCount = days.filter(day => day.selected).length;

  const handleDayClick = (dayId: number) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;

    // Si está seleccionado y tenemos el mínimo, permitir deseleccionar
    if (day.selected && selectedCount > minSelections) {
      onDayToggle(dayId);
      return;
    }

    // Si no está seleccionado y no hemos llegado al máximo, permitir seleccionar
    if (!day.selected && selectedCount < maxSelections) {
      onDayToggle(dayId);
      return;
    }

    // Si no está seleccionado pero hemos llegado al máximo, no hacer nada
    if (!day.selected && selectedCount >= maxSelections) {
      return;
    }

    // Si está seleccionado pero estamos en el mínimo, no hacer nada
    if (day.selected && selectedCount <= minSelections) {
      return;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Título y contador */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-runapp-navy mb-2">
          Selecciona tus días de entrenamiento
        </h3>
        <p className="text-sm text-runapp-gray">
          {selectedCount} de {maxSelections} días seleccionados
        </p>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = day.selected;
          const canSelect = !isSelected && selectedCount < maxSelections;
          const canDeselect = isSelected && selectedCount > minSelections;
          const isClickable = canSelect || canDeselect;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDayClick(day.id)}
              disabled={!isClickable}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 no-select
                ${isSelected
                  ? 'bg-runapp-purple border-runapp-purple text-white shadow-lg scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-runapp-light-purple hover:bg-runapp-light-purple/10'
                }
                ${!isClickable && !isSelected 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                min-h-[80px] relative
              `}
            >
              {/* Letra del día */}
              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-runapp-navy'}`}>
                {day.shortName}
              </span>
              
              {/* Fecha */}
              <span className={`text-xs mt-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {getDateLabel(day.date)}
              </span>

              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs text-runapp-purple">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Toca los días para seleccionar tu horario de entrenamiento
        </p>
        {selectedCount >= maxSelections && (
          <p className="text-xs text-runapp-purple mt-1">
            Has alcanzado el máximo de días seleccionables
          </p>
        )}
        {selectedCount <= minSelections && selectedCount > 0 && (
          <p className="text-xs text-orange-500 mt-1">
            Selecciona al menos {minSelections} día{minSelections > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default DaySelector;
