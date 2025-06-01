import React from 'react';
import chroma from 'chroma-js';

interface BaseColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl';
  onChange: (color: string) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  borderStyle?: 'solid' | 'dashed';
  empty?: boolean;
}

const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id, className = '', style = {}, borderStyle = 'solid', empty = false }) => {
  const handleClick = () => {
    if (empty) {
      onChange(color);
    } else {
      document.getElementById(id || 'base-color-picker')?.click();
    }
  };
  return (
    <div
      className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer border-2 ${borderStyle === 'dashed' ? 'border-dashed border-gray-400' : 'border-solid border-white'} ${className}`}
      onClick={handleClick}
      style={{ background: empty ? 'transparent' : color, ...style }}
    >
      {!empty && (
        <span
          className="absolute text-xs text-black text-opacity-80"
          style={{
            marginTop: 16,
            top: '100%',
            left: 0,
            right: 0,
            textAlign: 'center',
            textTransform: 'uppercase'
          }}
          >
          {colorFormat === 'hsl'
            ? chroma(color).hsl().slice(0, 3).map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ')
            : color
          }
        </span>
      )}
      <input
        id={id || 'base-color-picker'}
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        disabled={empty}
      />
    </div>
  );
};

export default BaseColorSwatch; 