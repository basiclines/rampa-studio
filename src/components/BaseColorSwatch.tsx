import React from 'react';
import chroma from 'chroma-js';

interface BaseColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl';
  onChange: (color: string) => void;
  id?: string;
}

const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id }) => {
  return (
    <div className="relative w-full h-20 rounded-lg overflow-hidden cursor-pointer border border-gray-200" onClick={() => document.getElementById(id || 'base-color-picker')?.click()} style={{ background: color }}>
      <span className="absolute left-2 top-2 text-xs text-white text-opacity-90 bg-black bg-opacity-50 backdrop-blur-sm px-2 py-0.5 rounded">
        {colorFormat === 'hsl'
          ? chroma(color).hsl().slice(0, 3).map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ')
          : color
        }
      </span>
      <input
        id={id || 'base-color-picker'}
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};

export default BaseColorSwatch; 