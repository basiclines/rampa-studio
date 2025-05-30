import React from 'react';
import chroma from 'chroma-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlendMode } from '@/types/colorRamp';

interface TintColorSwatchProps {
  color: string;
  colorFormat: 'hex' | 'hsl';
  opacity: number;
  blendMode?: BlendMode;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onBlendModeChange: (blendMode: BlendMode) => void;
  onRemove: () => void;
  id?: string;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
}

const TintColorSwatch: React.FC<TintColorSwatchProps> = ({
  color,
  colorFormat,
  opacity,
  blendMode,
  onColorChange,
  onOpacityChange,
  onBlendModeChange,
  onRemove,
  id,
  onPreviewBlendMode,
}) => {
  return (
    <div className="space-y-2">
      <div className="relative w-full h-12 rounded-lg overflow-hidden cursor-pointer border border-gray-200" onClick={() => document.getElementById(id || 'tint-color-picker')?.click()} style={{ background: chroma(color || '#000000').alpha((opacity || 0) / 100).css() }}>
        <span className="absolute left-2 top-2 text-xs text-white text-opacity-90 bg-black bg-opacity-50 backdrop-blur-sm px-2 py-0.5 rounded">
          {colorFormat === 'hsl'
            ? (() => {
                const hsl = chroma(color || '#000000').hsl().slice(0, 3);
                const safeH = isNaN(hsl[0]) ? 0 : Math.round(hsl[0]);
                const safeS = Math.round(hsl[1] * 100);
                const safeL = Math.round(hsl[2] * 100);
                return `${safeH}, ${safeS}, ${safeL}`;
              })()
            : (color || '#000000')
          }
        </span>
        <input
          id={id || 'tint-color-picker'}
          type="color"
          value={color || '#000000'}
          onChange={e => onColorChange(e.target.value)}
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs">Opacity: {opacity || 0}%</label>
        <Slider
          value={[opacity || 0]}
          onValueChange={([value]) => onOpacityChange(value)}
          max={100}
          min={0}
          step={1}
          className="flex-1"
        />
        <Input
          type="number"
          value={opacity || 0}
          onChange={e => {
            const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onOpacityChange(value);
          }}
          min={0}
          max={100}
          className="w-16 text-center"
        />
      </div>
      {opacity > 0 && (
        <div className="space-y-2">
          <label className="text-xs">Blend Mode</label>
          <Select
            value={blendMode || 'normal'}
            onValueChange={value => onBlendModeChange(value as BlendMode)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select blend mode" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto z-50">
              {['normal','darken','multiply','plus-darker','color-burn','lighten','screen','plus-lighter','color-dodge','overlay','soft-light','hard-light','difference','exclusion','hue','saturation','color','luminosity'].map(mode => (
                <SelectItem
                  key={mode}
                  value={mode}
                  onMouseEnter={() => onPreviewBlendMode?.(mode)}
                  onMouseLeave={() => onPreviewBlendMode?.(undefined)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/-/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button variant="ghost" size="sm" onClick={onRemove} className="ml-2">Remove</Button>
    </div>
  );
};

export default TintColorSwatch; 