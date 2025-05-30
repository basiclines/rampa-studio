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
    <div className="relative w-full flex items-center group h-4">
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
      <div className="absolute left-0 top-1/2 w-full h-1 group-hover:h-4 transition-all duration-200 -translate-y-1/2 flex items-center">
        {/* Filled bar */}
        <div
          className="bg-gray-500"
          style={{ width: `${percent}%`, height: '100%', borderRadius: 0, zIndex: 1 }}
        />
        {/* Track bar */}
        <div
          className="absolute left-0 top-0 w-full bg-gray-200"
          style={{ height: '100%', borderRadius: 0, zIndex: 0 }}
        />
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
          className="absolute"
          style={{ right: `calc(100% - ${percent}%)`, top: '0', bottom: '0', zIndex: 2 }}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-full">
            <div className="px-2 text-white text-xs font-semibold h-full">
              {formatValue ? formatValue(value) : value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabeledSlider; 