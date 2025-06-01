import React, { useState } from 'react';
import { Edit3, Copy, Trash2, RotateCcw, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import chroma from 'chroma-js';
import { useToast } from '@/hooks/use-toast';
import GradientSliders from '@/components/GradientSliders';
import { ColorRampConfig, BlendMode } from '@/types/colorRamp';
import BaseColorSwatch from './BaseColorSwatch';
import TintColorSwatch from './TintColorSwatch';
import LightnessControl from './LightnessControl';
import HueControl from './HueControl';
import SaturationControl from './SaturationControl';
import LabeledSlider from './LabeledSlider';
import HSLPropertiesControl from './HSLPropertiesControl';

interface ColorRampControlsProps {
  ramp: ColorRampConfig;
  canDelete: boolean;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
  closeSidebar: () => void;
}

const SegmentedControl = ({ value, onChange }: { value: 'simple' | 'gradient' | 'hex' | 'hsl', onChange: (v: 'simple' | 'gradient' | 'hex' | 'hsl') => void }) => (
  <div className="inline-flex rounded-md border border-gray-200 bg-white overflow-hidden text-xs">
    <button
      className={`px-2 py-1 ${value === 'simple' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('simple')}
      type="button"
    >Simple</button>
    <button
      className={`px-2 py-1 ${value === 'gradient' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('gradient')}
      type="button"
    >Gradient</button>
  </div>
);

const ColorFormatControl = ({ value, onChange }: { value: 'hex' | 'hsl', onChange: (v: 'hex' | 'hsl') => void }) => (
  <div className="inline-flex w-full rounded-md border border-gray-200 bg-white overflow-hidden text-xs">
    <button
      className={`flex-1 px-2 py-1 ${value === 'hex' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('hex')}
      type="button"
    >HEX</button>
    <button
      className={`flex-1 px-2 py-1 ${value === 'hsl' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={() => onChange('hsl')}
      type="button"
    >HSL</button>
  </div>
);

// Add scale types in English
const SCALE_TYPES = [
  { value: 'linear', label: 'Linear' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'fibonacci', label: 'Fibonacci' },
  { value: 'golden-ratio', label: 'Golden Ratio' },
  { value: 'logarithmic', label: 'Logarithmic' },
  { value: 'powers-of-2', label: 'Powers of 2' },
  { value: 'musical-ratio', label: 'Musical Ratio' },
  { value: 'cielab-uniform', label: 'CIELAB Uniform Steps' },
  { value: 'ease-in', label: 'Ease-in' },
  { value: 'ease-out', label: 'Ease-out' },
  { value: 'ease-in-out', label: 'Ease-in-out' },
  { value: 'exponential', label: 'Exponential' },
  { value: 'sine', label: 'Sine' },
  { value: 'cubic-bezier', label: 'Cubic-bezier' },
  { value: 'back', label: 'Back' },
  { value: 'elastic', label: 'Elastic' },
];

// Track implemented scale types
const IMPLEMENTED_SCALES = ['linear', 'geometric', 'fibonacci', 'golden-ratio', 'logarithmic', 'powers-of-2', 'musical-ratio', 'cielab-uniform', 'ease-in', 'ease-out', 'ease-in-out'];

const ColorRampControls: React.FC<ColorRampControlsProps> = ({
  ramp,
  canDelete,
  onUpdate,
  onDuplicate,
  onDelete,
  onPreviewBlendMode,
  closeSidebar,
}) => {
  const { toast } = useToast();

  const [showTint, setShowTint] = useState(!!ramp.tintColor);
  const [lightnessScale, setLightnessScale] = useState('linear');
  const [hueScale, setHueScale] = useState('linear');
  const [saturationScale, setSaturationScale] = useState('linear');

  const resetAttribute = (attribute: 'lightness' | 'hue' | 'saturation') => {
    try {
      const baseColor = chroma(ramp.baseColor);
      const [h, s, l] = baseColor.hsl();
      
      const updates: Partial<ColorRampConfig> = {};
      
      switch (attribute) {
        case 'lightness':
          updates.lightnessRange = 0;
          updates.lightnessAdvanced = false;
          updates.lightnessStart = (l || 0.5) * 100;
          updates.lightnessEnd = (l || 0.5) * 100;
          break;
        case 'hue':
          updates.chromaRange = 0;
          updates.chromaAdvanced = false;
          updates.chromaStart = 0;
          updates.chromaEnd = 0;
          break;
        case 'saturation':
          updates.saturationRange = 0;
          updates.saturationAdvanced = false;
          updates.saturationStart = (s || 0.5) * 100;
          updates.saturationEnd = (s || 0.5) * 100;
          break;
      }
      
      onUpdate(updates);
      
      toast({
        title: `${attribute.charAt(0).toUpperCase() + attribute.slice(1)} Reset`,
        description: `${attribute} has been reset to base color values.`,
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Could not reset the attribute values.",
        variant: "destructive",
      });
    }
  };

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

  // Check if any advanced mode is enabled
  const hasAdvancedMode = ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced;

  return (
    <div
      className="fixed top-0 left-0 z-40"
      style={{
        width: 320,
        height: '100vh',
        transition: 'width 0.2s',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(100px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Close button */}
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <Button variant="ghost" size="sm" onClick={closeSidebar}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-0 flex flex-col">
        {/* Main layout: Controls and Gradient Sliders side by side */}
        <div className="flex gap-4 h-full flex-1">
          {/* Controls Column */}
          <div className={`flex-1 flex flex-col h-full min-h-0`}>
            {/* Main config section */}
            <div className="pb-6 mb-6 border-b border-gray-200 flex-shrink-0">
              <ColorFormatControl
                value={ramp.colorFormat || 'hex'}
                onChange={(format) => onUpdate({ colorFormat: format })}
              />
              <div className="space-y-2 mt-4">
                <Label>Steps</Label>
                <LabeledSlider
                  value={ramp.totalSteps}
                  onChange={value => onUpdate({ totalSteps: Math.round(value) })}
                  min={3}
                  max={100}
                  step={1}
                  formatValue={v => `${v}`}
                  ariaLabel="Steps"
                />
              </div>
            </div>

            {/* Color mix section */}
            <div className="pb-6 mb-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Color mix</div>
                {showTint ? (
                  <span
                    className="text-red-600 hover:underline cursor-pointer text-sm"
                    onClick={() => {
                      onUpdate({ tintColor: undefined, tintOpacity: 0, tintBlendMode: undefined });
                      setShowTint(false);
                    }}
                  >
                    Remove tint
                  </span>
                ) : (
                  <span
                    className="text-blue-600 hover:underline cursor-pointer text-sm"
                    onClick={() => {
                      setShowTint(true);
                      const updates: Partial<ColorRampConfig> = {};
                      if (!ramp.tintColor) {
                        updates.tintColor = '#FE0000';
                      }
                      if (!ramp.tintOpacity) {
                        updates.tintOpacity = 12;
                      }
                      if (Object.keys(updates).length > 0) {
                        onUpdate(updates);
                      }
                    }}
                  >
                    Add tint
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {showTint && (
                  <TintColorSwatch
                    color={ramp.tintColor || '#000000'}
                    colorFormat={ramp.colorFormat || 'hex'}
                    opacity={ramp.tintOpacity || 0}
                    blendMode={ramp.tintBlendMode}
                    onColorChange={color => onUpdate({ tintColor: color })}
                    onOpacityChange={opacity => onUpdate({ tintOpacity: opacity })}
                    onBlendModeChange={blendMode => onUpdate({ tintBlendMode: blendMode })}
                    onRemove={() => { onUpdate({ tintColor: undefined, tintOpacity: 0, tintBlendMode: undefined }); setShowTint(false); }}
                    id={`tint-color-picker-${ramp.id}`}
                    onPreviewBlendMode={onPreviewBlendMode}
                  />
                )}
                <BaseColorSwatch
                  color={ramp.baseColor}
                  colorFormat={ramp.colorFormat || 'hex'}
                  onChange={color => onUpdate({ baseColor: color })}
                  id={`base-color-picker-${ramp.id}`}
                />
              </div>
            </div>

            {/* Properties section */}
            <div className={hasAdvancedMode ? 'flex-1 min-h-0 flex flex-col' : 'flex-shrink-0'}>
              <HSLPropertiesControl
                ramp={ramp}
                onUpdate={onUpdate}
                lightnessScale={lightnessScale}
                setLightnessScale={setLightnessScale}
                hueScale={hueScale}
                setHueScale={setHueScale}
                saturationScale={saturationScale}
                setSaturationScale={setSaturationScale}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorRampControls;
