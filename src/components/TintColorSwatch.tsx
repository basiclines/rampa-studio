import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import { SketchPicker, ColorResult } from 'react-color';
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
  empty = false,
  overlap = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setShowPicker(!showPicker);
  };

  const handleColorChange = (colorResult: ColorResult) => {
    onColorChange(colorResult.hex);
  };

  const handleClose = () => {
    setShowPicker(false);
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPicker) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when picker is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPicker]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const formatColor = (color: string, format: 'hex' | 'hsl') => {
    if (format === 'hsl') {
      const hsl = chroma(color).hsl();
      return hsl.map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ');
    }
    return color;
  };

  return (
    <>
      <div className={`relative w-full h-full rounded-full flex items-center justify-center cursor-pointer`}
        onClick={handleClick}
        style={{
          position: 'absolute', left: '70%', top: '5%', transform: 'translate(-50%, 0%)', width: 128, height: 128,
          background: empty ? 'transparent' : chroma(color || '#FE0000').alpha((opacity || 0) / 100).css(),
          mixBlendMode: overlap && blendMode && [
            'normal','darken','multiply','color-burn','lighten','screen','color-dodge','overlay','soft-light','hard-light','difference','exclusion','hue','saturation','color','luminosity'
          ].includes(blendMode)
            ? (blendMode as React.CSSProperties['mixBlendMode'])
            : undefined,
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
      </div>
      
      {showPicker && !empty && (
        <div
          ref={pickerRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'transparent',
          }}
          onClick={handleClose}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SketchPicker
              color={color || '#FE0000'}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
              disableAlpha={true}
              className="sketch-picker"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TintColorSwatch; 