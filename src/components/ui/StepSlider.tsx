import React, { useState, useRef } from 'react';

interface StepSliderProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  onPreview?: (value: T | undefined) => void;
  className?: string;
  ariaLabel?: string;
}

function StepSlider<T extends string | number>({
  options,
  value,
  onChange,
  onPreview,
  className = '',
  ariaLabel,
}: StepSliderProps<T>) {
  const [hovered, setHovered] = useState<T | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the index of the current value
  const currentIdx = options.findIndex(opt => opt.value === value);

  // Helper to get index from mouse/touch position
  const getStepFromPosition = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return currentIdx;
    const x = clientX - rect.left;
    const stepWidth = rect.width / options.length;
    let idx = Math.floor(x / stepWidth);
    idx = Math.max(0, Math.min(options.length - 1, idx));
    return idx;
  };

  // Mouse/touch event handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    window.addEventListener('mousemove', handlePointerMove as any);
    window.addEventListener('touchmove', handlePointerMove as any, { passive: false });
    window.addEventListener('mouseup', handlePointerUp as any);
    window.addEventListener('touchend', handlePointerUp as any);
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    let clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const idx = getStepFromPosition(clientX);
    onChange(options[idx].value);
    if (onPreview) onPreview(options[idx].value);
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (onPreview) onPreview(undefined);
    window.removeEventListener('mousemove', handlePointerMove as any);
    window.removeEventListener('touchmove', handlePointerMove as any);
    window.removeEventListener('mouseup', handlePointerUp as any);
    window.removeEventListener('touchend', handlePointerUp as any);
  };

  // Clean up listeners if unmounted while dragging
  React.useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handlePointerMove as any);
      window.removeEventListener('touchmove', handlePointerMove as any);
      window.removeEventListener('mouseup', handlePointerUp as any);
      window.removeEventListener('touchend', handlePointerUp as any);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      aria-label={ariaLabel}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', height: 48, paddingTop: 24 }}
    >
      {/* Steps as flex children */}
      <div className="relative flex flex-row w-full h-full z-10">
        
        {/* Track */}
        <div
          className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 z-0 r-material-dark-thin"
          />
        
        {/* Thumb */}
        {currentIdx >= 0 && (
          <div
            className="absolute z-20 h-full"
            style={{
              left: `calc(${(currentIdx) / options.length * 100}%)`,
              width: `calc(${1 / options.length * 100}%)`,
              top: '0',
              pointerEvents: 'none',
            }}
          >
            <div className="w-3 h-3 absolute rounded-full r-material r-slider-thumb"
              style={{
                left: '50%',
                top: '50%',
                marginTop: '-6px',
                marginLeft: '-6px',
              }}
            />
          </div>
        )}

        {options.map((option, idx) => {
          const isActive = value === option.value;
          const isHovered = hovered === option.value;
          const isActiveAndResting = (isActive && hovered === undefined);
          return (
            <div
              key={option.value}
              className="flex-1 flex flex-col items-center justify-center cursor-pointer h-full relative"
              onMouseEnter={() => {
                setHovered(option.value);
                onPreview && onPreview(option.value);
              }}
              onMouseLeave={() => {
                setHovered(undefined);
                onPreview && onPreview(undefined);
              }}
              onClick={e => {
                e.stopPropagation();
                onChange(option.value);
              }}
              style={{ minWidth: 0 }}
            >
              {/* Step vertical line centered in the step area */}
              <div
                className={`rounded transition-all duration-150 r-material-dark`}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 4,
                  height: 4,
                  transform: `translate(-50%, -50%) ${isActive || isHovered ? 'scale(2)' : 'scale(1)'}`
                }}
              />
              {/* Label (only on hover or active) */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 rounded text-black text-xs whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
                  (isHovered || isActiveAndResting) ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: 10, bottom: "100%", marginBottom: 8 }}
              >
                {option.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepSlider; 