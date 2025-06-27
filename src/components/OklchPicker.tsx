import React, { useState, useEffect } from 'react';
import { convertToOklch, convertFromOklch, constrainOklchValues, type OklchColor } from '@/engine/OklchEngine';
import OklchField from './OklchField';
import OklchHueSlider from './OklchHueSlider';
import OklchInputs from './OklchInputs';

interface OklchPickerProps {
  color: string;           // Current color (any format)
  onChange: (color: string) => void; // Returns hex for compatibility
  onChangeComplete?: (color: string) => void;
  width?: number;
  height?: number;
}

const OklchPicker: React.FC<OklchPickerProps> = ({ 
  color, 
  onChange, 
  onChangeComplete,
  width = 200,
  height = 150 
}) => {
  const [oklch, setOklch] = useState<OklchColor>(() => convertToOklch(color));
  const [isInternalChange, setIsInternalChange] = useState(false);

  // Update internal state when external color changes (but not from our own changes)
  useEffect(() => {
    if (!isInternalChange) {
      const newOklch = convertToOklch(color);
      
      // Only update if the values are significantly different (prevent rounding oscillations)
      const threshold = 0.001;
      const lDiff = Math.abs(newOklch.l - oklch.l);
      const cDiff = Math.abs(newOklch.c - oklch.c);
      const hDiff = Math.abs(newOklch.h - oklch.h);
      
      if (lDiff > threshold || cDiff > threshold || hDiff > threshold) {
        setOklch(newOklch);
      }
    }
    setIsInternalChange(false);
  }, [color, isInternalChange, oklch]);

  const handleOklchChange = (newOklch: OklchColor, complete = false) => {
    // Constrain values to valid ranges with smooth gamut clamping
    const constrainedOklch = constrainOklchValues(newOklch);
    setOklch(constrainedOklch);
    
    // Mark as internal change to prevent useEffect from overriding
    setIsInternalChange(true);
    
    // Convert back to hex for compatibility with existing system
    const hexColor = convertFromOklch(constrainedOklch);
    onChange(hexColor);
    
    if (complete && onChangeComplete) {
      onChangeComplete(hexColor);
    }
  };

  const handleLightnessChange = (l: number) => {
    handleOklchChange({ ...oklch, l });
  };

  const handleChromaChange = (c: number) => {
    handleOklchChange({ ...oklch, c });
  };

  const handleHueChange = (h: number, complete = false) => {
    // For hue changes, preserve L,C exactly and only change H
    // Keep the original L,C values to prevent oscillations from conversion roundtrips
    const newOklch = { 
      ...oklch, 
      h,
      // Explicitly preserve original L,C to avoid conversion artifacts
      l: oklch.l,
      c: oklch.c
    };
    setOklch(newOklch);
    
    // Mark as internal change to prevent useEffect from overriding our precise L,C values
    setIsInternalChange(true);
    
    // Convert to hex for external interface, but don't let it affect our internal OKLCH state
    const hexColor = convertFromOklch(newOklch);
    onChange(hexColor);
    
    if (complete && onChangeComplete) {
      onChangeComplete(hexColor);
    }
  };

  const handleFieldChange = (l: number, c: number, complete = false) => {
    handleOklchChange({ ...oklch, l, c }, complete);
  };

  const handleInputChange = (newOklch: OklchColor) => {
    // Input changes should also preserve precise values
    setOklch(newOklch);
    setIsInternalChange(true);
    
    const hexColor = convertFromOklch(newOklch);
    onChange(hexColor);
    
    if (onChangeComplete) {
      onChangeComplete(hexColor);
    }
  };

  return (
    <div className="oklch-picker bg-white border border-gray-200 rounded-lg shadow-lg p-4" style={{ width: width + 32 }}>
      {/* 2D Lightness/Chroma field */}
      <div className="mb-4">
        <OklchField 
          lightness={oklch.l}
          chroma={oklch.c}
          hue={oklch.h}
          width={width}
          height={height}
          onChange={handleFieldChange}
        />
      </div>
      
      {/* Hue slider */}
      <div className="mb-4">
        <OklchHueSlider 
          hue={oklch.h}
          lightness={oklch.l}
          chroma={oklch.c}
          width={width}
          onChange={handleHueChange}
        />
      </div>
      
      {/* Numeric inputs */}
      <div>
        <OklchInputs 
          oklch={oklch}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default OklchPicker;