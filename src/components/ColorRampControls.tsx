import React, { useState } from 'react';
import { Edit3, Copy, Trash2, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import chroma from 'chroma-js';
import { useToast } from '@/hooks/use-toast';
import GradientSliders from '@/components/GradientSliders';
import { ColorRampConfig, BlendMode } from '@/types/colorRamp';

interface ColorRampControlsProps {
  ramp: ColorRampConfig;
  canDelete: boolean;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
}

const SegmentedControl = ({ value, onChange }: { value: 'simple' | 'gradient' | 'proportional', onChange: (v: 'simple' | 'gradient' | 'proportional') => void }) => (
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
    <button
      className="px-2 py-1 text-gray-400 bg-gray-50 cursor-not-allowed"
      disabled
      type="button"
    >Proportional</button>
  </div>
);

const ColorRampControls: React.FC<ColorRampControlsProps> = ({
  ramp,
  canDelete,
  onUpdate,
  onDuplicate,
  onDelete,
  onPreviewBlendMode,
}) => {
  const { toast } = useToast();

  const [showTint, setShowTint] = useState(!!ramp.tintColor);

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
    <div className="space-y-6">
      {/* Header removed as requested */}

      {/* Main layout: Controls and Gradient Sliders side by side */}
      <div className={`flex gap-4 ${hasAdvancedMode ? 'h-[400px]' : ''}`}>
        {/* Controls Column */}
        <div className="flex-1 space-y-6">
          {/* Base color and steps */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`base-color-${ramp.id}`}>Base Color</Label>
              <div className="flex gap-2">
                <Input
                  id={`base-color-${ramp.id}`}
                  type="color"
                  value={ramp.baseColor}
                  onChange={(e) => onUpdate({ baseColor: e.target.value })}
                  className="w-16 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <Input
                  value={ramp.baseColor}
                  onChange={(e) => onUpdate({ baseColor: e.target.value })}
                  className="flex-1"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            
            {!showTint && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setShowTint(true);
                    const updates: Partial<ColorRampConfig> = {};
                    if (!ramp.tintColor) {
                      updates.tintColor = '#000000';
                    }
                    if (!ramp.tintOpacity) {
                      updates.tintOpacity = 10;
                    }
                    if (Object.keys(updates).length > 0) {
                      onUpdate(updates);
                    }
                  }}
                >
                  Add tint color
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Total Steps: {ramp.totalSteps}</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[ramp.totalSteps]}
                  onValueChange={([value]) => onUpdate({ totalSteps: Math.round(value) })}
                  max={100}
                  min={3}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={ramp.totalSteps}
                  onChange={(e) => {
                    const value = Math.max(3, Math.min(100, parseInt(e.target.value) || 3));
                    onUpdate({ totalSteps: value });
                  }}
                  min={3}
                  max={100}
                  className="w-16 text-center"
                />
              </div>
            </div>
          </div>

          {/* Tint controls (hidden by default, shown if showTint is true or a tint is set) */}
          {showTint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`tint-color-${ramp.id}`}>Tint Color</Label>
                <div className="flex gap-2">
                  <Input
                    id={`tint-color-${ramp.id}`}
                    type="color"
                    value={ramp.tintColor || '#000000'}
                    onChange={(e) => onUpdate({ tintColor: e.target.value })}
                    className="w-16 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={ramp.tintColor || '#000000'}
                    onChange={(e) => onUpdate({ tintColor: e.target.value })}
                    className="flex-1"
                    placeholder="#000000"
                  />
                  <Button variant="ghost" size="sm" onClick={() => { onUpdate({ tintColor: undefined, tintOpacity: 0, tintBlendMode: undefined }); setShowTint(false); }} className="ml-2">Remove</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tint Opacity: {ramp.tintOpacity || 0}%</Label>
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[ramp.tintOpacity || 0]}
                    onValueChange={([value]) => onUpdate({ tintOpacity: value })}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={ramp.tintOpacity || 0}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                      onUpdate({ tintOpacity: value });
                    }}
                    min={0}
                    max={100}
                    className="w-16 text-center"
                  />
                </div>
              </div>
              {ramp.tintOpacity && ramp.tintOpacity > 0 && (
                <div className="space-y-2">
                  <Label>Blend Mode</Label>
                  <Select
                    value={ramp.tintBlendMode || 'normal'}
                    onValueChange={(value: BlendMode) => 
                      onUpdate({ tintBlendMode: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select blend mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto z-50">
                      <SelectItem 
                        value="normal"
                        onMouseEnter={() => onPreviewBlendMode?.('normal')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Normal
                      </SelectItem>
                      <SelectItem 
                        value="darken"
                        onMouseEnter={() => onPreviewBlendMode?.('darken')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Darken
                      </SelectItem>
                      <SelectItem 
                        value="multiply"
                        onMouseEnter={() => onPreviewBlendMode?.('multiply')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Multiply
                      </SelectItem>
                      <SelectItem 
                        value="plus-darker"
                        onMouseEnter={() => onPreviewBlendMode?.('plus-darker')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Plus Darker
                      </SelectItem>
                      <SelectItem 
                        value="color-burn"
                        onMouseEnter={() => onPreviewBlendMode?.('color-burn')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Color Burn
                      </SelectItem>
                      <SelectItem 
                        value="lighten"
                        onMouseEnter={() => onPreviewBlendMode?.('lighten')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Lighten
                      </SelectItem>
                      <SelectItem 
                        value="screen"
                        onMouseEnter={() => onPreviewBlendMode?.('screen')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Screen
                      </SelectItem>
                      <SelectItem 
                        value="plus-lighter"
                        onMouseEnter={() => onPreviewBlendMode?.('plus-lighter')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Plus Lighter
                      </SelectItem>
                      <SelectItem 
                        value="color-dodge"
                        onMouseEnter={() => onPreviewBlendMode?.('color-dodge')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Color Dodge
                      </SelectItem>
                      <SelectItem 
                        value="overlay"
                        onMouseEnter={() => onPreviewBlendMode?.('overlay')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Overlay
                      </SelectItem>
                      <SelectItem 
                        value="soft-light"
                        onMouseEnter={() => onPreviewBlendMode?.('soft-light')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Soft Light
                      </SelectItem>
                      <SelectItem 
                        value="hard-light"
                        onMouseEnter={() => onPreviewBlendMode?.('hard-light')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Hard Light
                      </SelectItem>
                      <SelectItem 
                        value="difference"
                        onMouseEnter={() => onPreviewBlendMode?.('difference')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Difference
                      </SelectItem>
                      <SelectItem 
                        value="exclusion"
                        onMouseEnter={() => onPreviewBlendMode?.('exclusion')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Exclusion
                      </SelectItem>
                      <SelectItem 
                        value="hue"
                        onMouseEnter={() => onPreviewBlendMode?.('hue')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Hue
                      </SelectItem>
                      <SelectItem 
                        value="saturation"
                        onMouseEnter={() => onPreviewBlendMode?.('saturation')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Saturation
                      </SelectItem>
                      <SelectItem 
                        value="color"
                        onMouseEnter={() => onPreviewBlendMode?.('color')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Color
                      </SelectItem>
                      <SelectItem 
                        value="luminosity"
                        onMouseEnter={() => onPreviewBlendMode?.('luminosity')}
                        onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                      >
                        Luminosity
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Color Adjustment Controls */}
          <div className="space-y-4">
            {/* Lightness Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {ramp.lightnessAdvanced ? 'Lightness Range' : `Lightness Range: ${Math.round(ramp.lightnessRange * 10) / 10}%`}
                </Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetAttribute('lightness')}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <SegmentedControl
                    value={ramp.lightnessAdvanced ? 'gradient' : 'simple'}
                    onChange={(mode) => {
                      if (mode === 'simple') {
                        onUpdate({ lightnessAdvanced: false });
                      } else if (mode === 'gradient') {
                        const updates: Partial<ColorRampConfig> = { lightnessAdvanced: true };
                        const defaults = calculateAdvancedDefaults('lightness');
                        updates.lightnessStart = ramp.lightnessStart ?? defaults.start;
                        updates.lightnessEnd = ramp.lightnessEnd ?? defaults.end;
                        onUpdate(updates);
                      }
                    }}
                  />
                </div>
              </div>
              
              {ramp.lightnessAdvanced ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start (%)</Label>
                    <Input
                      type="number"
                      value={ramp.lightnessStart ?? calculateAdvancedDefaults('lightness').start}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ lightnessStart: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          const roundedValue = Math.round(value * 10) / 10;
                          onUpdate({ lightnessStart: roundedValue });
                        }
                      }}
                      min={0}
                      max={100}
                      step={0.1}
                      className="text-center text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End (%)</Label>
                    <Input
                      type="number"
                      value={ramp.lightnessEnd ?? calculateAdvancedDefaults('lightness').end}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ lightnessEnd: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          const roundedValue = Math.round(value * 10) / 10;
                          onUpdate({ lightnessEnd: roundedValue });
                        }
                      }}
                      min={0}
                      max={100}
                      step={0.1}
                      className="text-center text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[ramp.lightnessRange]}
                    onValueChange={([value]) => {
                      const roundedValue = Math.round(value * 10) / 10;
                      onUpdate({ lightnessRange: roundedValue });
                    }}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(ramp.lightnessRange * 10) / 10}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                      const roundedValue = Math.round(value * 10) / 10;
                      onUpdate({ lightnessRange: roundedValue });
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-16 text-center"
                  />
                </div>
              )}
            </div>
            
            {/* Hue Shift Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {ramp.chromaAdvanced ? 'Hue Range' : `Hue Shift: ${Math.round(ramp.chromaRange)}°`}
                </Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetAttribute('hue')}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <SegmentedControl
                    value={ramp.chromaAdvanced ? 'gradient' : 'simple'}
                    onChange={(mode) => {
                      if (mode === 'simple') {
                        onUpdate({ chromaAdvanced: false });
                      } else if (mode === 'gradient') {
                        const updates: Partial<ColorRampConfig> = { chromaAdvanced: true };
                        const defaults = calculateAdvancedDefaults('hue');
                        updates.chromaStart = ramp.chromaStart ?? defaults.start;
                        updates.chromaEnd = ramp.chromaEnd ?? defaults.end;
                        onUpdate(updates);
                      }
                    }}
                  />
                </div>
              </div>
              
              {ramp.chromaAdvanced ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="number"
                      value={ramp.chromaStart ?? calculateAdvancedDefaults('hue').start}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ chromaStart: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          const roundedValue = Math.round(value);
                          onUpdate({ chromaStart: roundedValue });
                        }
                      }}
                      step={1}
                      className="text-center text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input
                      type="number"
                      value={ramp.chromaEnd ?? calculateAdvancedDefaults('hue').end}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ chromaEnd: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          const roundedValue = Math.round(value);
                          onUpdate({ chromaEnd: roundedValue });
                        }
                      }}
                      step={1}
                      className="text-center text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[ramp.chromaRange]}
                    onValueChange={([value]) => {
                      const roundedValue = Math.round(value);
                      onUpdate({ chromaRange: roundedValue });
                    }}
                    max={180}
                    min={-180}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(ramp.chromaRange)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= -180 && value <= 180) {
                        const roundedValue = Math.round(value);
                        onUpdate({ chromaRange: roundedValue });
                      }
                    }}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-16 text-center"
                  />
                </div>
              )}
            </div>
            
            {/* Saturation Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {ramp.saturationAdvanced ? 'Saturation Range' : `Saturation Range: ${Math.round(ramp.saturationRange * 10) / 10}%`}
                </Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetAttribute('saturation')}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <SegmentedControl
                    value={ramp.saturationAdvanced ? 'gradient' : 'simple'}
                    onChange={(mode) => {
                      if (mode === 'simple') {
                        onUpdate({ saturationAdvanced: false });
                      } else if (mode === 'gradient') {
                        const updates: Partial<ColorRampConfig> = { saturationAdvanced: true };
                        const defaults = calculateAdvancedDefaults('saturation');
                        updates.saturationStart = ramp.saturationStart ?? defaults.start;
                        updates.saturationEnd = ramp.saturationEnd ?? defaults.end;
                        onUpdate(updates);
                      }
                    }}
                  />
                </div>
              </div>
              
              {ramp.saturationAdvanced ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start (%)</Label>
                    <Input
                      type="number"
                      value={ramp.saturationStart ?? calculateAdvancedDefaults('saturation').start}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ saturationStart: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          const roundedValue = Math.round(value * 10) / 10;
                          onUpdate({ saturationStart: roundedValue });
                        }
                      }}
                      step={0.1}
                      className="text-center text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End (%)</Label>
                    <Input
                      type="number"
                      value={ramp.saturationEnd ?? calculateAdvancedDefaults('saturation').end}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          onUpdate({ saturationEnd: 0 });
                          return;
                        }
                        const value = parseFloat(inputValue);
                        if (!isNaN(value)) {
                          const roundedValue = Math.round(value * 10) / 10;
                          onUpdate({ saturationEnd: roundedValue });
                        }
                      }}
                      step={0.1}
                      className="text-center text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Slider
                    value={[ramp.saturationRange]}
                    onValueChange={([value]) => {
                      const roundedValue = Math.round(value * 10) / 10;
                      onUpdate({ saturationRange: roundedValue });
                    }}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={Math.round(ramp.saturationRange * 10) / 10}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                      const roundedValue = Math.round(value * 10) / 10;
                      onUpdate({ saturationRange: roundedValue });
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-16 text-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gradient Sliders Column */}
        <GradientSliders ramp={ramp} onUpdate={onUpdate} />
      </div>
    </div>
  );
};

export default ColorRampControls;
