
import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';

interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  totalSteps: number;
  lightnessRange: number;
  lightnessStart?: number;
  lightnessEnd?: number;
  lightnessAdvanced?: boolean;
  chromaRange: number;
  chromaStart?: number;
  chromaEnd?: number;
  chromaAdvanced?: boolean;
  saturationRange: number;
  saturationStart?: number;
  saturationEnd?: number;
  saturationAdvanced?: boolean;
  tintColor?: string;
  tintOpacity?: number;
  tintBlendMode?: 'normal' | 'multiply' | 'overlay';
  lockedColors: { [index: number]: string };
}

interface GradientSlidersProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
}

const GradientSliders: React.FC<GradientSlidersProps> = ({ ramp, onUpdate }) => {
  const calculateAdvancedDefaults = (attribute: 'lightness' | 'hue' | 'saturation') => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h, s, l] = baseColor.hsl();
      
      switch (attribute) {
        case 'lightness': {
          const baseLightness = (l || 0.5) * 100;
          const range = ramp.lightnessRange;
          return {
            start: Math.round((Math.max(0, Math.min(100, baseLightness - range / 2))) * 10) / 10,
            end: Math.round((Math.max(0, Math.min(100, baseLightness + range / 2))) * 10) / 10
          };
        }
        case 'hue': {
          const range = ramp.chromaRange;
          return {
            start: Math.round((-range / 2) * 10) / 10,
            end: Math.round((range / 2) * 10) / 10
          };
        }
        case 'saturation': {
          const baseSaturation = (s || 0.5) * 100;
          const range = ramp.saturationRange;
          return {
            start: Math.round((Math.max(0, Math.min(100, baseSaturation - range / 2))) * 10) / 10,
            end: Math.round((Math.max(0, Math.min(100, baseSaturation + range / 2))) * 10) / 10
          };
        }
        default:
          return { start: 0, end: 0 };
      }
    } catch (error) {
      console.error('Error calculating advanced defaults:', error);
      return { start: 0, end: 0 };
    }
  };

  // Generate gradient scales based on the base color
  const generateLightnessGradient = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h, s] = baseColor.hsl();
      const colors: string[] = [];
      
      // From base color to white (lightness 0 to 100%)
      for (let i = 0; i <= 10; i++) {
        const lightness = i / 10;
        colors.push(chroma.hsl(h || 0, s || 0, lightness).hex());
      }
      return colors;
    } catch (error) {
      console.error('Error generating lightness gradient:', error);
      // Fallback to grayscale
      const colors: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const lightness = i / 10;
        colors.push(chroma.hsl(0, 0, lightness).hex());
      }
      return colors;
    }
  };

  const generateHueGradient = () => {
    const colors: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const hue = (i / 10) * 360;
      colors.push(chroma.hsl(hue, 1, 0.5).hex());
    }
    return colors;
  };

  const generateSaturationGradient = () => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h, , l] = baseColor.hsl();
      const colors: string[] = [];
      
      // From completely desaturated base color to base color (saturation 0 to 100%)
      for (let i = 0; i <= 10; i++) {
        const saturation = i / 10;
        colors.push(chroma.hsl(h || 0, saturation, l || 0.5).hex());
      }
      return colors;
    } catch (error) {
      console.error('Error generating saturation gradient:', error);
      // Fallback to grayscale to color
      const colors: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const saturation = i / 10;
        colors.push(chroma.hsl(0, saturation, 0.5).hex());
      }
      return colors;
    }
  };

  const hasAdvancedMode = ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced;

  if (!hasAdvancedMode) {
    return null;
  }

  return (
    <div className="flex gap-2 h-full min-h-[400px]">
      {ramp.lightnessAdvanced && (
        <div className="flex flex-col h-full">
          <GradientControl
            label="Lightness"
            startValue={ramp.lightnessStart ?? calculateAdvancedDefaults('lightness').start}
            endValue={ramp.lightnessEnd ?? calculateAdvancedDefaults('lightness').end}
            min={0}
            max={100}
            onValuesChange={(start, end) => onUpdate({ lightnessStart: start, lightnessEnd: end })}
            formatValue={(v) => `${Math.round(v * 10) / 10}%`}
            gradientColors={generateLightnessGradient()}
            referenceValue={(() => {
              try {
                const baseColor = chroma(ramp.baseColor);
                const [, , l] = baseColor.hsl();
                return (l || 0.5) * 100;
              } catch {
                return 50;
              }
            })()}
            className="h-full flex-1"
          />
        </div>
      )}
      
      {ramp.chromaAdvanced && (
        <div className="flex flex-col h-full">
          <GradientControl
            label="Hue"
            startValue={ramp.chromaStart ?? calculateAdvancedDefaults('hue').start}
            endValue={ramp.chromaEnd ?? calculateAdvancedDefaults('hue').end}
            min={-180}
            max={180}
            onValuesChange={(start, end) => onUpdate({ chromaStart: start, chromaEnd: end })}
            formatValue={(v) => `${Math.round(v)}°`}
            gradientColors={generateHueGradient()}
            referenceValue={0}
            className="h-full flex-1"
          />
        </div>
      )}
      
      {ramp.saturationAdvanced && (
        <div className="flex flex-col h-full">
          <GradientControl
            label="Saturation"
            startValue={ramp.saturationStart ?? calculateAdvancedDefaults('saturation').start}
            endValue={ramp.saturationEnd ?? calculateAdvancedDefaults('saturation').end}
            min={0}
            max={100}
            onValuesChange={(start, end) => onUpdate({ saturationStart: start, saturationEnd: end })}
            formatValue={(v) => `${Math.round(v * 10) / 10}%`}
            gradientColors={generateSaturationGradient()}
            referenceValue={(() => {
              try {
                const baseColor = chroma(ramp.baseColor);
                const [, s] = baseColor.hsl();
                return (s || 0.5) * 100;
              } catch {
                return 50;
              }
            })()}
            className="h-full flex-1"
          />
        </div>
      )}
    </div>
  );
};

export default GradientSliders;
