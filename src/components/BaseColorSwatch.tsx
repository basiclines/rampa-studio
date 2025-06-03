import React from 'react';
import chroma from 'chroma-js';
import { formatColorValues } from '@/lib/colorUtils';

interface BaseColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl';
  onChange: (color: string) => void;
  id?: string;
  empty?: boolean;
}

const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id, empty = false }) => {
  const handleClick = () => {
    if (empty) {
      onChange(color);
    } else {
      document.getElementById(id || 'base-color-picker')?.click();
    }
  };
  return (
    <div
      className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 ${empty ? 'border-dashed border-gray-400' : 'border-solid border-white'}`}
      onClick={handleClick}
      style={{
        background: empty ? 'transparent' : color,
        position: 'absolute',
        left: empty ? '70%' : '30%',
        top: '5%',
        transform: 'translate(-50%, 0%)',
        width: 128,
        height: 128 }}
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
          {formatColorValues(color, colorFormat)}
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