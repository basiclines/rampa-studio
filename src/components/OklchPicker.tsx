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

  // Update internal state when external color changes
  useEffect(() => {
    const newOklch = convertToOklch(color);
    setOklch(newOklch);
  }, [color]);

  const handleOklchChange = (newOklch: OklchColor, complete = false) => {
    // Constrain values to valid ranges with smooth gamut clamping
    const constrainedOklch = constrainOklchValues(newOklch);
    setOklch(constrainedOklch);
    
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
    // Don't apply constrainOklchValues since we want to preserve user's L,C intent
    const newOklch = { ...oklch, h };
    setOklch(newOklch);
    
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
    handleOklchChange(newOklch, true);
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