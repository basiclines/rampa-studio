import React, { useState, useEffect } from 'react';
import { convertToOklch, convertFromOklch, constrainOklchValues, formatOklchString, parseOklchString, roundOklch, type OklchColor } from '@/engine/OklchEngine';
import { DEFAULT_OKLCH_SWATCHES } from '@/config/DefaultColorSwatches';
import OklchField from './OklchField';
import OklchHueSlider from './OklchHueSlider';

interface OklchPickerProps {
  color: string;           // Current color (any format)
  onChange: (color: string) => void; // Returns color in OKLCH format
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
  const [oklch, setOklch] = useState<OklchColor>(() => {
    // Avoid unnecessary conversion if color is already OKLCH
    if (color.startsWith('oklch(')) {
      const parsed = parseOklchString(color);
      return parsed || convertToOklch(color);
    }
    return convertToOklch(color);
  });

  // Update internal state when external color changes
  useEffect(() => {
    // Avoid unnecessary conversion if color is already OKLCH
    let newOklch: OklchColor;
    if (color.startsWith('oklch(')) {
      const parsed = parseOklchString(color);
      newOklch = parsed || convertToOklch(color);
    } else {
      newOklch = convertToOklch(color);
    }
    setOklch(newOklch);
  }, [color]);

  const handleOklchChange = (newOklch: OklchColor, complete = false) => {
    // Constrain values to valid ranges with smooth gamut clamping
    const constrainedOklch = constrainOklchValues(newOklch);
    setOklch(constrainedOklch);
    
    // Return OKLCH string format instead of hex
    const oklchString = formatOklchString(constrainedOklch);
    onChange(oklchString);
    
    if (complete && onChangeComplete) {
      onChangeComplete(oklchString);
    }
  };

  const handleLightnessChange = (l: number) => {
    handleOklchChange({ ...oklch, l });
  };

  const handleChromaChange = (c: number) => {
    handleOklchChange({ ...oklch, c });
  };

  const handleHueChange = (h: number, complete = false) => {
    // For hue changes, we need to apply gamut clamping because different hues
    // have different maximum chroma values. Use preserveLC to avoid lightness drift.
    const newOklch = { ...oklch, h };
    const constrainedOklch = constrainOklchValues(newOklch, true); // preserveLC = true
    setOklch(constrainedOklch);
    
    const oklchString = formatOklchString(constrainedOklch);
    onChange(oklchString);
    
    if (complete && onChangeComplete) {
      onChangeComplete(oklchString);
    }
  };

  const handleFieldChange = (l: number, c: number, complete = false) => {
    handleOklchChange({ ...oklch, l, c }, complete);
  };

  // Use default OKLCH swatches from config
  const sampleColors = DEFAULT_OKLCH_SWATCHES;

  const handleSwatchClick = (oklchColor: string) => {
    const parsed = parseOklchString(oklchColor);
    if (parsed) {
      handleOklchChange(parsed, true);
    }
  };

  return (
    <div className="oklch-picker r-popover inline-block" style={{ padding: 10, width: width + 20 }}>

      <OklchField 
        lightness={oklch.l}
        chroma={oklch.c}
        hue={oklch.h}
        width={width}
        height={height}
        onChange={handleFieldChange}
      />
      
      <OklchHueSlider 
        hue={oklch.h}
        lightness={oklch.l}
        chroma={oklch.c}
        width={width}
        onChange={handleHueChange}
      />

      <div 
        className="flexbox-fix" 
        style={{ 
          margin: '0 -10px -10px', 
          padding: '10px 0px 0px 10px', 
          borderTop: '1px solid rgb(238, 238, 238)', 
          display: 'flex', 
          flexWrap: 'wrap', 
          position: 'relative' 
        }}
      >
        {sampleColors.map((oklchColor, index) => (
          <div 
            key={index}
            style={{ 
              width: '16px', 
              height: '16px', 
              margin: '0px 10px 10px 0px' 
            }}
          >
            <span>
              <div
                title={oklchColor}
                tabIndex={0}
                onClick={() => handleSwatchClick(oklchColor)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSwatchClick(oklchColor);
                  }
                }}
                style={{
                  background: oklchColor,
                  height: '100%',
                  width: '100%',
                  cursor: 'pointer',
                  position: 'relative',
                  outline: 'none',
                  borderRadius: '3px',
                  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset'
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OklchPicker;