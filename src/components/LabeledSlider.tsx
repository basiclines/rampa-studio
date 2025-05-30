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
  return (
    <div className="relative w-full flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-with-label"
        style={{ zIndex: 1 }}
      />
      {/* Custom thumb label (absolutely positioned) */}
      <div
        className="pointer-events-none absolute top-1/2 left-0 transform -translate-y-1/2"
        style={{
          left: `calc(${((value - min) / (max - min)) * 100}% - 18px)`,
          zIndex: 2,
        }}
      >
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold shadow border-2 border-white">
          {formatValue ? formatValue(value) : value}
        </div>
      </div>
    </div>
  );
};

export default LabeledSlider; 