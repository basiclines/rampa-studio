import React from 'react';
import chroma from 'chroma-js';
import { BlendMode } from '@/entities/BlendModeEntity';

interface TintColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl';
  opacity: number;
  blendMode?: BlendMode;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onBlendModeChange: (blendMode: BlendMode) => void;
  onRemove: () => void;
  id?: string;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
  className?: string;
  style?: React.CSSProperties;
  borderStyle?: 'solid' | 'dashed';
  empty?: boolean;
  overlap?: boolean;
}

const TintColorSwatch: React.FC<TintColorSwatchProps> = ({
  color,
  colorFormat,
  opacity,
  blendMode,
  onColorChange,
  id,
  className = '',
  style = {},
  borderStyle = 'solid',
  empty = false,
  overlap = false,
}) => {
  const formatColor = (color: string, format: 'hex' | 'hsl') => {
    if (format === 'hsl') {
      const hsl = chroma(color).hsl();
      return hsl.map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ');
    }
    return color;
  };

  return (
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 ${borderStyle === 'dashed' ? 'border-dashed border-black border-opacity-20' : 'border-solid border-transparent'} ${className}`}
      onClick={() => document.getElementById(id || 'tint-color-picker')?.click()}
      style={{
        background: empty ? 'transparent' : chroma(color || '#FE0000').alpha((opacity || 0) / 100).css(),
        mixBlendMode: overlap && blendMode && [
          'normal','darken','multiply','color-burn','lighten','screen','color-dodge','overlay','soft-light','hard-light','difference','exclusion','hue','saturation','color','luminosity'
        ].includes(blendMode)
          ? (blendMode as React.CSSProperties['mixBlendMode'])
          : undefined,
        ...style
      }}
    >
      {!empty && (
        <span className="absolute text-xs text-black text-opacity-80"
        style={{
          marginTop: 16,
          top: '100%',
          left: 0,
          right: 0,
          textAlign: 'center',
          textTransform: 'uppercase'
        }}>
          {formatColor(color || '#FE0000', colorFormat)}
        </span>
      )}
      <input
        id={id || 'tint-color-picker'}
        type="color"
        value={color || '#FE0000'}
        onChange={e => onColorChange(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};

export default TintColorSwatch; 