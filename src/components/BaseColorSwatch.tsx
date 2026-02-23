import React, { useState, useEffect, useRef } from 'react';
import chroma from 'chroma-js';
import { SketchPicker, ColorResult } from 'react-color';
import { convertToOklch, formatOklchString } from '@/engine/OklchEngine';
import { ColorFormat } from '@/entities/ColorRampEntity';
import { DEFAULT_HEX_SWATCHES } from '@/config/DefaultColorSwatches';
import OklchPicker from './OklchPicker';
import EditableColorValue from './EditableColorValue';

interface BaseColorSwatchProps {
  color: string;
  colorFormat: ColorFormat;
  onChange: (color: string) => void;
  id?: string;
  rampId?: string;
  empty?: boolean;
  size?: number;
  /** Which side the picker should open toward. Default 'left' (positioned at left:0). */
  pickerAlign?: 'left' | 'right';
}

const BaseColorSwatch: React.FC<BaseColorSwatchProps> = ({ color, colorFormat, onChange, id, rampId, empty = false, size = 128, pickerAlign = 'left' }) => {
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
    if (colorFormat === 'hsl') {
      const [h, s, l] = chroma(colorResult.hex).hsl();
      const hslString = `hsl(${Math.round(h || 0)}, ${Math.round((s || 0) * 100)}%, ${Math.round((l || 0) * 100)}%)`;
      onChange(hslString);
    } else {
      onChange(colorResult.hex);
    }
  };

  const handleOklchChange = (oklchColor: string) => {
    onChange(oklchColor);
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

  const formatColor = (color: string, format: ColorFormat) => {
    try {
      if (format === 'hsl') {
        const hsl = chroma(color).hsl();
        return hsl.map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ');
      }
      if (format === 'oklch') {
        // If the color is already in OKLCH format, return it as-is to avoid precision loss
        if (color.startsWith('oklch(')) {
          return color;
        }
        // Otherwise, convert to OKLCH
        const oklch = convertToOklch(color);
        return formatOklchString(oklch);
      }
      return color; // hex format
    } catch (error) {
      console.error('Error formatting color:', error);
      return color; // Fallback to original color
    }
  };

  const compact = size < 128;

  return (
    <>
      <div
        className={`relative rounded-full flex items-center justify-center cursor-pointer border border-black/20`}
        onClick={handleClick}
        style={{
          background: empty ? 'transparent' : color,
          position: 'absolute',
          left: compact ? '50%' : (empty ? '60%' : '35%'),
          top: compact ? '0%' : '5%',
          transform: 'translate(-50%, 0%)',
          width: size,
          height: size }}
      >
        {!empty && rampId && (
          <div
            className="absolute"
            style={{
              marginTop: 8,
              top: '100%',
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <EditableColorValue
              color={color}
              colorFormat={colorFormat}
              rampId={rampId}
              colorType="base"
              onBlur={() => setShowPicker(false)}
              onShowPicker={() => setShowPicker(true)}
              pickerRef={pickerRef}

            />
          </div>
        )}
        {!empty && !rampId && (
          <div
            className="absolute"
            style={{
              marginTop: compact ? 4 : 16,
              top: '100%',
              left: compact ? -8 : 0,
              right: compact ? -8 : 0,
              textAlign: 'center',
            }}
          >
            <input
              className="bg-transparent text-center font-mono text-muted-foreground outline-none border-none w-full"
              style={{ fontSize: compact ? 9 : 12 }}
              value={color}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              spellCheck={false}
            />
          </div>
        )}
      </div>
      
      {showPicker && !empty && (
        <div
          ref={pickerRef}
          onClick={handleClose}

        >
          <div
            style={{
              position: 'absolute',
              ...(pickerAlign === 'right' ? { right: '0%' } : { left: '0%' }),
              top: '100%',
              marginTop: 24,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {colorFormat === 'oklch' ? (
              <OklchPicker
                color={color}
                onChange={handleOklchChange}
                onChangeComplete={handleOklchChange}
                width={200}
                height={150}
              />
            ) : (
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                onChangeComplete={handleColorChange}
                disableAlpha={true}
                presetColors={DEFAULT_HEX_SWATCHES}
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