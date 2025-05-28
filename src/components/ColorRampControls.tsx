
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

interface ColorRampControlsProps {
  ramp: ColorRampConfig;
  canDelete: boolean;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
}

const ColorRampControls: React.FC<ColorRampControlsProps> = ({
  ramp,
  canDelete,
  onUpdate,
  onDuplicate,
  onDelete,
  onPreviewBlendMode,
}) => {
  const { toast } = useToast();

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
      {/* Header with name and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Edit3 className="w-4 h-4 text-gray-400" />
          <Input
            value={ramp.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="border border-gray-200 p-2 text-lg font-semibold bg-white focus-visible:ring-2 focus-visible:ring-blue-500 flex-1"
            placeholder="Color ramp name"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="text-blue-500 hover:text-blue-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

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
            
            <div className="space-y-2">
              <Label>Total Steps: {ramp.totalSteps}</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[ramp.totalSteps]}
                  onValueChange={([value]) => onUpdate({ totalSteps: Math.round(value) })}
                  max={21}
                  min={3}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={ramp.totalSteps}
                  onChange={(e) => {
                    const value = Math.max(3, Math.min(21, parseInt(e.target.value) || 3));
                    onUpdate({ totalSteps: value });
                  }}
                  min={3}
                  max={21}
                  className="w-16 text-center"
                />
              </div>
            </div>
          </div>

          {/* Tint controls */}
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

            {ramp.tintColor && ramp.tintOpacity && ramp.tintOpacity > 0 && (
              <div className="space-y-2">
                <Label>Blend Mode</Label>
                <Select
                  value={ramp.tintBlendMode || 'normal'}
                  onValueChange={(value: ColorRampConfig['tintBlendMode']) => 
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
                      value="overlay"
                      onMouseEnter={() => onPreviewBlendMode?.('overlay')}
                      onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                    >
                      Overlay
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updates: Partial<ColorRampConfig> = { lightnessAdvanced: !ramp.lightnessAdvanced };
                      if (!ramp.lightnessAdvanced) {
                        const defaults = calculateAdvancedDefaults('lightness');
                        updates.lightnessStart = ramp.lightnessStart ?? defaults.start;
                        updates.lightnessEnd = ramp.lightnessEnd ?? defaults.end;
                      }
                      onUpdate(updates);
                    }}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updates: Partial<ColorRampConfig> = { chromaAdvanced: !ramp.chromaAdvanced };
                      if (!ramp.chromaAdvanced) {
                        const defaults = calculateAdvancedDefaults('hue');
                        updates.chromaStart = ramp.chromaStart ?? defaults.start;
                        updates.chromaEnd = ramp.chromaEnd ?? defaults.end;
                      }
                      onUpdate(updates);
                    }}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updates: Partial<ColorRampConfig> = { saturationAdvanced: !ramp.saturationAdvanced };
                      if (!ramp.saturationAdvanced) {
                        const defaults = calculateAdvancedDefaults('saturation');
                        updates.saturationStart = ramp.saturationStart ?? defaults.start;
                        updates.saturationEnd = ramp.saturationEnd ?? defaults.end;
                      }
                      onUpdate(updates);
                    }}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
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
