import React, { useEffect, useRef, useCallback, useState } from 'react';

interface ScrollPickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  unit: string;
  label: string;
}

const ScrollPicker: React.FC<ScrollPickerProps> = ({
  values,
  selectedValue,
  onValueChange,
  unit,
  label
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const itemHeight = 40;
  const visibleItems = 5;
  const containerHeight = itemHeight * visibleItems;

  // Scroll to selected value smoothly
  const scrollToValue = useCallback((value: string, smooth = true) => {
    const selectedIndex = values.indexOf(value);
    if (selectedIndex !== -1 && containerRef.current) {
      const scrollTop = selectedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [values, itemHeight]);

  // Initialize scroll position
  useEffect(() => {
    scrollToValue(selectedValue, false);
  }, [selectedValue, scrollToValue]);

  // Handle scroll with debouncing for smoother experience
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounced scroll handling
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const centerIndex = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(centerIndex, values.length - 1));
      
      if (values[clampedIndex] !== selectedValue) {
        onValueChange(values[clampedIndex]);
      }

      // Smooth snap to center
      const targetScrollTop = clampedIndex * itemHeight;
      if (Math.abs(scrollTop - targetScrollTop) > 2) { // Only snap if not already close
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }

      setIsScrolling(false);
    }, 100); // Reduced timeout for more responsive feeling
  }, [values, selectedValue, onValueChange, itemHeight]);

  const handleItemClick = useCallback((value: string) => {
    onValueChange(value);
    scrollToValue(value, true);
  }, [onValueChange, scrollToValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <label className="block text-base font-medium text-runapp-navy text-center">
        {label}
      </label>
      
      <div className="relative">
        {/* Selection indicator - center box */}
        <div 
          className="absolute left-0 right-0 bg-gray-100 rounded-lg pointer-events-none z-10 border border-gray-300 flex items-center justify-center"
          style={{
            top: `${itemHeight * 2}px`,
            height: `${itemHeight}px`
          }}
        >
          <span className="text-lg font-semibold text-runapp-navy">
            {selectedValue} <span className="text-sm text-runapp-navy">{unit}</span>
          </span>
        </div>

        {/* Adjacent values overlay */}
        {(() => {
          const selectedIndex = values.indexOf(selectedValue);
          const prevValue = selectedIndex > 0 ? values[selectedIndex - 1] : null;
          const nextValue = selectedIndex < values.length - 1 ? values[selectedIndex + 1] : null;
          const prevValue2 = selectedIndex > 1 ? values[selectedIndex - 2] : null;
          const nextValue2 = selectedIndex < values.length - 2 ? values[selectedIndex + 2] : null;

          return (
            <>
              {/* Two positions above */}
              {prevValue2 && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{
                    top: `${itemHeight * 0}px`,
                    height: `${itemHeight}px`
                  }}
                >
                  <span className="text-sm text-gray-300">
                    {prevValue2} <span className="text-xs">{unit}</span>
                  </span>
                </div>
              )}

              {/* One position above */}
              {prevValue && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{
                    top: `${itemHeight * 1}px`,
                    height: `${itemHeight}px`
                  }}
                >
                  <span className="text-base text-gray-500">
                    {prevValue} <span className="text-sm text-gray-400">{unit}</span>
                  </span>
                </div>
              )}

              {/* One position below */}
              {nextValue && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{
                    top: `${itemHeight * 3}px`,
                    height: `${itemHeight}px`
                  }}
                >
                  <span className="text-base text-gray-500">
                    {nextValue} <span className="text-sm text-gray-400">{unit}</span>
                  </span>
                </div>
              )}

              {/* Two positions below */}
              {nextValue2 && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{
                    top: `${itemHeight * 4}px`,
                    height: `${itemHeight}px`
                  }}
                >
                  <span className="text-sm text-gray-300">
                    {nextValue2} <span className="text-xs">{unit}</span>
                  </span>
                </div>
              )}
            </>
          );
        })()}
        
        {/* Fade gradients */}
        <div 
          className="absolute left-0 right-0 bg-gradient-to-b from-white via-transparent to-transparent pointer-events-none z-20"
          style={{ top: 0, height: `${itemHeight * 1}px` }}
        />
        <div 
          className="absolute left-0 right-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none z-20"
          style={{ bottom: 0, height: `${itemHeight * 1}px` }}
        />
        
        {/* Scroll container */}
        <div
          ref={containerRef}
          className="overflow-y-scroll overflow-x-hidden relative bg-white rounded-xl border-2 border-gray-200 scroll-smooth"
          style={{ 
            height: `${containerHeight}px`,
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch', // Better iOS scrolling
            scrollSnapType: 'y proximity', // Gentle snapping
            scrollPadding: `${itemHeight * 2}px` // Account for padding
          }}
          onScroll={handleScroll}
        >
          {/* Top padding */}
          <div style={{ height: `${itemHeight * 2}px` }} />
          
          {/* Values */}
          {values.map((value, index) => (
            <div
              key={value}
              className="flex items-center justify-center cursor-pointer transition-all duration-200"
              style={{ 
                height: `${itemHeight}px`,
                scrollSnapAlign: 'center'
              }}
              onClick={() => handleItemClick(value)}
            >
              <span className="text-base text-transparent select-none">
                {value} <span className="text-sm">{unit}</span>
              </span>
            </div>
          ))}
          
          {/* Bottom padding */}
          <div style={{ height: `${itemHeight * 2}px` }} />
        </div>
      </div>
    </div>
  );
};

export default ScrollPicker;