import React, { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ColorRampConfig, BlendMode } from '@/types/colorRamp';
import GradientControl from './GradientControl';

interface ColorRampControlsProps {
  ramp: ColorRampConfig;
  canDelete: boolean;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreviewBlendMode: (blendMode: string | undefined) => void;
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
  const [isLightnessAdvanced, setIsLightnessAdvanced] = useState(ramp.lightnessAdvanced || false);
  const [isChromaAdvanced, setIsChromaAdvanced] = useState(ramp.chromaAdvanced || false);
  const [isSaturationAdvanced, setIsSaturationAdvanced] = useState(ramp.saturationAdvanced || false);

  const handleDuplicate = useCallback(() => {
    onDuplicate();
    toast({
      title: "Color Ramp Duplicated",
      description: `${ramp.name} has been duplicated.`,
    });
  }, [onDuplicate, ramp.name, toast]);

  return (
    <div className="space-y-6">
      {/* Header with name and delete button */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={ramp.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="mt-1"
          />
        </div>
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Base Color */}
      <div>
        <Label htmlFor="baseColor">Base Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="baseColor"
            type="color"
            value={ramp.baseColor}
            onChange={(e) => onUpdate({ baseColor: e.target.value })}
            className="w-16 h-10 p-1 rounded cursor-pointer"
          />
          <Input
            value={ramp.baseColor}
            onChange={(e) => onUpdate({ baseColor: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      {/* Total Steps */}
      <div>
        <Label htmlFor="totalSteps">Total Steps</Label>
        <Input
          id="totalSteps"
          type="number"
          value={ramp.totalSteps.toString()}
          onChange={(e) => onUpdate({ totalSteps: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>

      <Separator />

      {/* Lightness Range */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="lightnessRange">Lightness Range</Label>
          <Switch id="lightnessRange" checked={isLightnessAdvanced} onCheckedChange={(checked) => {
            setIsLightnessAdvanced(checked);
            onUpdate({ lightnessAdvanced: checked });
          }} />
        </div>
        {isLightnessAdvanced ? (
          <GradientControl 
            startValue={ramp.lightnessStart ?? 0}
            endValue={ramp.lightnessEnd ?? 100}
            onUpdate={(start, end) => {
              onUpdate({ 
                lightnessStart: start,
                lightnessEnd: end
              });
            }}
          />
        ) : (
          <Slider
            id="lightnessRange"
            defaultValue={[ramp.lightnessRange]}
            max={100}
            step={1}
            onValueChange={(value) => onUpdate({ lightnessRange: value[0] })}
            className="mt-2"
          />
        )}
      </div>

      {/* Chroma Range */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="chromaRange">Chroma Range</Label>
           <Switch id="chromaRange" checked={isChromaAdvanced} onCheckedChange={(checked) => {
            setIsChromaAdvanced(checked);
            onUpdate({ chromaAdvanced: checked });
          }} />
        </div>
        {isChromaAdvanced ? (
          <GradientControl 
            startValue={ramp.chromaStart ?? 0}
            endValue={ramp.chromaEnd ?? 100}
            onUpdate={(start, end) => {
              onUpdate({ 
                chromaStart: start,
                chromaEnd: end
              });
            }}
          />
        ) : (
          <Slider
            id="chromaRange"
            defaultValue={[ramp.chromaRange]}
            max={100}
            step={1}
            onValueChange={(value) => onUpdate({ chromaRange: value[0] })}
            className="mt-2"
          />
        )}
      </div>

      {/* Saturation Range */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="saturationRange">Saturation Range</Label>
          <Switch id="saturationRange" checked={isSaturationAdvanced} onCheckedChange={(checked) => {
            setIsSaturationAdvanced(checked);
            onUpdate({ saturationAdvanced: checked });
          }} />
        </div>
        {isSaturationAdvanced ? (
          <GradientControl 
            startValue={ramp.saturationStart ?? 0}
            endValue={ramp.saturationEnd ?? 100}
            onUpdate={(start, end) => {
              onUpdate({ 
                saturationStart: start,
                saturationEnd: end
              });
            }}
          />
        ) : (
          <Slider
            id="saturationRange"
            defaultValue={[ramp.saturationRange]}
            max={100}
            step={1}
            onValueChange={(value) => onUpdate({ saturationRange: value[0] })}
            className="mt-2"
          />
        )}
      </div>

      <Separator />

      {/* Tint Color */}
      <div>
        <Label htmlFor="tintColor">Tint Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="tintColor"
            type="color"
            value={ramp.tintColor || '#000000'}
            onChange={(e) => onUpdate({ tintColor: e.target.value })}
            className="w-16 h-10 p-1 rounded cursor-pointer"
          />
          <Input
            value={ramp.tintColor || '#000000'}
            onChange={(e) => onUpdate({ tintColor: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      {/* Tint Opacity */}
      <div>
        <Label htmlFor="tintOpacity">Tint Opacity</Label>
        <Slider
          id="tintOpacity"
          defaultValue={[ramp.tintOpacity || 0]}
          max={100}
          step={1}
          onValueChange={(value) => onUpdate({ tintOpacity: value[0] })}
          className="mt-2"
        />
      </div>

      {/* Tint Blend Mode */}
      <div>
        <Label htmlFor="tintBlendMode">Tint Blend Mode</Label>
        <Select onValueChange={(value) => onPreviewBlendMode(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select blend mode" defaultValue={ramp.tintBlendMode || 'normal'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="darken">Darken</SelectItem>
            <SelectItem value="multiply">Multiply</SelectItem>
            <SelectItem value="plus-darker">Plus Darker</SelectItem>
            <SelectItem value="color-burn">Color Burn</SelectItem>
            <SelectItem value="lighten">Lighten</SelectItem>
            <SelectItem value="screen">Screen</SelectItem>
            <SelectItem value="plus-lighter">Plus Lighter</SelectItem>
            <SelectItem value="color-dodge">Color Dodge</SelectItem>
            <SelectItem value="overlay">Overlay</SelectItem>
            <SelectItem value="soft-light">Soft Light</SelectItem>
            <SelectItem value="hard-light">Hard Light</SelectItem>
            <SelectItem value="difference">Difference</SelectItem>
            <SelectItem value="exclusion">Exclusion</SelectItem>
            <SelectItem value="hue">Hue</SelectItem>
            <SelectItem value="saturation">Saturation</SelectItem>
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="luminosity">Luminosity</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ColorRampControls;
