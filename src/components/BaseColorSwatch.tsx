import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import { SketchPicker, ColorResult } from 'react-color';
import { convertToOklch, formatOklchString } from '@/engine/OklchEngine';
import OklchPicker from './OklchPicker';

interface BaseColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl' | 'oklch';
  onChange: (color: string) => void;
  id?: string;
  empty?: boolean;
}

const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id, empty = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (empty) {
      onChange(color);
    } else {
      setShowPicker(!showPicker);
    }
  };

  const handleColorChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
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

  const formatColor = (color: string, format: 'hex' | 'hsl' | 'oklch') => {
    if (format === 'hsl') {
      const hsl = chroma(color).hsl();
      return hsl.map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ');
    }
    if (format === 'oklch') {
      try {
        const oklch = convertToOklch(color);
        return formatOklchString(oklch);
      } catch (error) {
        console.error('Error formatting OKLCH color:', error);
        return color; // Fallback to original color
      }
    }
    return color;
  };

  return (
    <>
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer`}
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
            {formatColor(color, colorFormat)}
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
            {colorFormat === 'oklch' ? (
              <OklchPicker
                color={color}
                onChange={onChange}
                onChangeComplete={onChange}
                width={250}
                height={150}
              />
            ) : (
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                onChangeComplete={handleColorChange}
                disableAlpha={true}
                className="sketch-picker"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BaseColorSwatch; 