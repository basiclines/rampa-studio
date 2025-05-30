import React from 'react';

interface LabeledSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  ariaLabel?: string;
}

const LabeledSlider: React.FC<LabeledSliderProps> = ({ value, onChange, min, max, step = 1, formatValue, ariaLabel }) => {
  // Calculate percent for filled bar and handler
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full flex items-center group h-1 hover:h-4 transition-all duration-200">
      <style>{`
        .labeled-slider-thumb-hidden::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          background: transparent;
          border: none;
        }
        .labeled-slider-thumb-hidden::-moz-range-thumb {
          width: 0;
          height: 0;
          background: transparent;
          border: none;
        }
        .labeled-slider-thumb-hidden::-ms-thumb {
          width: 0;
          height: 0;
          background: transparent;
          border: none;
        }
      `}</style>
      {/* Filled bar */}
      <div
        className="absolute top-1/2 left-0 h-full bg-gray-500"
        style={{ width: `${percent}%`, transform: 'translateY(-50%)', borderRadius: 0, zIndex: 1 }}
      />
      {/* Track bar */}
      <div className="absolute top-1/2 left-0 w-full h-full bg-gray-200" style={{ transform: 'translateY(-50%)', borderRadius: 0, zIndex: 0 }} />
      {/* Input range (transparent) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={e => onChange(Number(e.target.value))}
        className="labeled-slider-thumb-hidden w-full h-full bg-transparent appearance-none absolute top-0 left-0 z-10 cursor-pointer"
        style={{ outline: 'none' }}
      />
      {/* Value label on hover, positioned at the end of the filled bar */}
      <div
        className="absolute top-0"
        style={{ left: `calc(${percent}% - 18px)`, zIndex: 2 }}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="px-2 py-1 text-white text-xs font-semibold">
            {formatValue ? formatValue(value) : value}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabeledSlider; 