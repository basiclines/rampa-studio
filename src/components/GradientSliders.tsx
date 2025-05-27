
import React from 'react';
import chroma from 'chroma-js';
import GradientControl from '@/components/GradientControl';
import { generateColorRamp } from '@/lib/colorUtils';

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

  const generateGradientColors = () => {
    try {
      const colors = generateColorRamp(ramp);
      return colors;
    } catch (error) {
      console.error('Error generating gradient colors:', error);
      return [];
    }
  };

  const gradientColors = generateGradientColors();
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
            gradientColors={gradientColors}
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
            gradientColors={gradientColors}
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
            gradientColors={gradientColors}
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
