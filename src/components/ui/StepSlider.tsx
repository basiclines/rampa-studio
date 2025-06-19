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
    const stepWidth = rect.width / (options.length - 1);
    let idx = Math.round(x / stepWidth);
    idx = Math.max(0, Math.min(options.length - 1, idx));
    return idx;
  };

  // Mouse/touch event handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const idx = getStepFromPosition(clientX);
    onChange(options[idx].value);
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

  // Calculate left position for a given index (0 to N-1)
  const getLeftPercent = (idx: number) => (options.length === 1 ? 0 : (idx / (options.length - 1)) * 100);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      aria-label={ariaLabel}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', height: 80, paddingTop: 24 }}
    >
      {/* Track */}
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 rounded-full -translate-y-1/2 z-0" />
      {/* Steps */}
      {options.map((option, idx) => {
        const isActive = value === option.value;
        const isHovered = hovered === option.value;
        const left = `calc(${getLeftPercent(idx)}% - ${100 / (2 * (options.length - 1))}%)`;
        const width = `calc(100% / ${options.length - 1})`;
        return (
          <div
            key={option.value}
            className="absolute flex flex-col items-center z-10 cursor-pointer"
            style={{ left, top: '50%', transform: 'translateY(-50%)', width, height: '100%' }}
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
          >
            {/* Step vertical line centered in the step area */}
            <div
              className={`w-0.5 h-4 rounded transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 scale-110 shadow-lg'
                  : isHovered
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
              style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
            {/* Label (only on hover or active) */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ zIndex: 10 }}
            >
              {option.label}
            </div>
          </div>
        );
      })}
      {/* Thumb */}
      <div
        className="absolute z-20"
        style={{
          left: `calc(${getLeftPercent(currentIdx)}% - 6px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <div className="w-3 h-6 border-2 border-white rounded shadow-md bg-black" />
      </div>
    </div>
  );
}

export default StepSlider; 