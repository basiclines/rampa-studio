import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMaxChromaForLH, type OklchColor } from '@/engine/OklchEngine';

interface OklchInputsProps {
  oklch: OklchColor;
  onChange: (oklch: OklchColor) => void;
}

const OklchInputs: React.FC<OklchInputsProps> = ({ oklch, onChange }) => {
  const [lightness, setLightness] = useState(() => Math.round(oklch.l * 100) / 100);
  const [chroma, setChroma] = useState(() => Math.round(oklch.c * 1000) / 1000);
  const [hue, setHue] = useState(() => Math.round(oklch.h));

  // Update local state when external values change
  useEffect(() => {
    setLightness(Math.round(oklch.l * 100) / 100);
    setChroma(Math.round(oklch.c * 1000) / 1000);
    setHue(Math.round(oklch.h));
  }, [oklch.l, oklch.c, oklch.h]);

  const handleLightnessChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const clampedL = Math.max(0, Math.min(1, num));
      setLightness(clampedL);
      
      // Ensure chroma doesn't exceed maximum for new lightness
      const maxChroma = getMaxChromaForLH(clampedL, oklch.h);
      const adjustedChroma = Math.min(oklch.c, maxChroma);
      
      onChange({
        ...oklch,
        l: clampedL,
        c: adjustedChroma
      });
    }
  };

  const handleChromaChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const maxChroma = getMaxChromaForLH(oklch.l, oklch.h);
      const clampedC = Math.max(0, Math.min(maxChroma, num));
      setChroma(clampedC);
      
      onChange({
        ...oklch,
        c: clampedC
      });
    }
  };

  const handleHueChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      // Normalize hue to 0-360 range
      const normalizedH = ((num % 360) + 360) % 360;
      setHue(normalizedH);
      
      // Ensure chroma doesn't exceed maximum for new hue
      const maxChroma = getMaxChromaForLH(oklch.l, normalizedH);
      const adjustedChroma = Math.min(oklch.c, maxChroma);
      
      onChange({
        ...oklch,
        h: normalizedH,
        c: adjustedChroma
      });
    }
  };

  const maxChroma = getMaxChromaForLH(oklch.l, oklch.h);
  const isChromaAtMax = chroma >= maxChroma * 0.95;

  return (
    <div className="oklch-inputs space-y-3">
      {/* Lightness */}
      <div className="space-y-1">
        <Label htmlFor="oklch-lightness" className="text-xs font-medium text-gray-700">
          Lightness
        </Label>
        <Input
          id="oklch-lightness"
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={lightness}
          onChange={(e) => handleLightnessChange(e.target.value)}
          className="text-xs h-8"
          placeholder="0.0 - 1.0"
        />
      </div>

      {/* Chroma */}
      <div className="space-y-1">
        <Label htmlFor="oklch-chroma" className="text-xs font-medium text-gray-700">
          Chroma {isChromaAtMax && <span className="text-orange-500">(max)</span>}
        </Label>
        <Input
          id="oklch-chroma"
          type="number"
          min="0"
          max={maxChroma}
          step="0.001"
          value={chroma}
          onChange={(e) => handleChromaChange(e.target.value)}
          className={`text-xs h-8 ${isChromaAtMax ? 'border-orange-300' : ''}`}
          placeholder={`0.0 - ${maxChroma.toFixed(3)}`}
        />
      </div>

      {/* Hue */}
      <div className="space-y-1">
        <Label htmlFor="oklch-hue" className="text-xs font-medium text-gray-700">
          Hue
        </Label>
        <Input
          id="oklch-hue"
          type="number"
          min="0"
          max="360"
          step="1"
          value={hue}
          onChange={(e) => handleHueChange(e.target.value)}
          className="text-xs h-8"
          placeholder="0 - 360"
        />
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>L: 0 (black) → 1 (white)</div>
        <div>C: 0 (gray) → max (vivid)</div>
        <div>H: 0° (red) → 360° (red)</div>
      </div>
    </div>
  );
};

export default OklchInputs;