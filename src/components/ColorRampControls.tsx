import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorRampConfig, ColorFormat } from '@/entities/ColorRampEntity';
import { BlendMode } from '@/entities/BlendModeEntity';
import BaseColorSwatch from './BaseColorSwatch';
import TintColorSwatch from './TintColorSwatch';
import LabeledSlider from './ui/LabeledSlider';
import HSLPropertiesControl from './HSLPropertiesControl';
import { useSetTintColor } from '@/usecases/SetTintColor';
import { useSetTintOpacity } from '@/usecases/SetTintOpacity';
import { useSetTintBlendMode } from '@/usecases/SetTintBlendMode';
import { useSetTotalSteps } from '@/usecases/SetTotalSteps';
import { useSetColorFormat } from '@/usecases/SetColorFormat';
import { useSetColorRampScale } from '@/usecases/SetColorRampScale';
import { useEditColorRampName } from '@/usecases/EditColorRampName';
import { useCreateHarmonyRamps } from '@/usecases/CreateHarmonyRamps';
import { useDuplicateColorRamp } from '@/usecases/DuplicateColorRamp';
import {
  getAnalogousColors,
  getTriadColors,
  getComplementaryColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '@/engine/ColorEngine';
import StepSlider from './ui/StepSlider';
import { CopyIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ColorRampControlsProps {
  ramp: ColorRampConfig;
  canDelete: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  onDelete: () => void;
  onPreviewBlendMode?: (blendMode: string | undefined) => void;
  previewScaleType?: string | null;
  setPreviewScaleType?: (type: string | null) => void;
}

const ColorFormatControl = ({ value, onChange }: { value: ColorFormat, onChange: (v: ColorFormat) => void }) => (
  <Tabs value={value} onValueChange={(v) => onChange(v as ColorFormat)} className="w-full">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="hex">HEX</TabsTrigger>
      <TabsTrigger value="hsl">HSL</TabsTrigger>
      <TabsTrigger value="oklch">OKLCH</TabsTrigger>
    </TabsList>
  </Tabs>
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
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onPreviewBlendMode,
  previewScaleType,
  setPreviewScaleType,
}) => {
  // Tint usecases
  const setTintColor = useSetTintColor();
  const setTintOpacity = useSetTintOpacity();
  const setTintBlendMode = useSetTintBlendMode();
  const setTotalSteps = useSetTotalSteps();
  const setColorFormat = useSetColorFormat();
  const setColorRampScale = useSetColorRampScale();
  const editColorRampName = useEditColorRampName();
  const createHarmonyRamps = useCreateHarmonyRamps();
  const duplicateColorRamp = useDuplicateColorRamp();

  const [showTint, setShowTint] = useState(!!ramp.tintColor);
  const [showHarmonyDialog, setShowHarmonyDialog] = useState(false);
  const [previewBlendMode, setPreviewBlendMode] = useState<BlendMode | undefined>(undefined);

  const handleRemoveTint = () => {
    setTintColor(ramp.id, '');
    setTintOpacity(ramp.id, 0);
    setTintBlendMode(ramp.id, 'normal');
    setShowTint(false);
  };

  const handleAddTint = () => {
    setShowTint(true);
    if (!ramp.tintColor) {
      setTintColor(ramp.id, '#FE0000');
    }
    if (!ramp.tintOpacity) {
      setTintOpacity(ramp.id, 12);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="left" className="flex flex-col overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Ramp Settings</SheetTitle>
          <SheetDescription>Configure color ramp properties</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 pt-4 flex-1 min-h-0 overflow-y-auto">
          {/* Ramp name */}
          <div>
            <Input
              value={ramp.name}
              onChange={e => editColorRampName(ramp.id, e.target.value)}
              placeholder="Ramp name"
              className="h-9 text-sm"
              spellCheck={false}
              onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            />
          </div>

          {/* Color format */}
          <div>
            <ColorFormatControl
              value={ramp.colorFormat || 'hex'}
              onChange={(format) => setColorFormat(ramp.id, format)}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <Label>Steps</Label>
            <LabeledSlider
              value={ramp.totalSteps}
              onChange={value => setTotalSteps(ramp.id, Math.round(value))}
              min={3}
              max={100}
              step={1}
              formatValue={v => `${v}`}
              ariaLabel="Steps"
            />
          </div>

          {/* Color mix section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color mix</div>
              {showTint ? (
                <span
                  className="text-destructive hover:underline cursor-pointer text-sm"
                  onClick={handleRemoveTint}
                >
                  Remove tint
                </span>
              ) : (
                <span
                  className="text-primary hover:underline cursor-pointer text-sm"
                  onClick={handleAddTint}
                >
                  Add tint
                </span>
              )}
            </div>
            {/* Two-circle layout */}
            <div className="flex items-center justify-center gap-0 relative h-32 mb-2 w-full" style={{ minHeight: 160 }}>
              <BaseColorSwatch
                color={ramp.baseColor}
                colorFormat={ramp.colorFormat || 'hex'}
                onChange={color => onUpdate({ baseColor: color })}
                id={`base-color-picker-${ramp.id}`}
                rampId={ramp.id}
              />
              <div className="relative w-full h-full z-20 pointer-events-none"
                style={{ position: 'absolute', left: '70%', top: '5%', transform: 'translate(-50%, 0%)', width: 128, height: 128 }}
              >
                <div
                  className={`absolute rounded-full pointer-events-none border-2 ${showTint ? 'border-solid border-white' : 'border-dashed border-border'}`}
                  style={{ left: '-2px', top: '-2px', right: '-2px', bottom: '-2px' }}
                ></div>
              </div>
              {showTint && (
                <TintColorSwatch
                  color={ramp.tintColor || '#FE0000'}
                  colorFormat={ramp.colorFormat || 'hex'}
                  opacity={ramp.tintOpacity || 0}
                  blendMode={['normal','darken','multiply','color-burn','lighten','screen','color-dodge','overlay','soft-light','hard-light','difference','exclusion','hue','saturation','color','luminosity'].includes((previewBlendMode || ramp.tintBlendMode) || '') ? (previewBlendMode || ramp.tintBlendMode) : 'normal'}
                  onColorChange={color => setTintColor(ramp.id, color)}
                  onOpacityChange={opacity => setTintOpacity(ramp.id, opacity)}
                  onBlendModeChange={blendMode => setTintBlendMode(ramp.id, blendMode)}
                  onRemove={handleRemoveTint}
                  id={`tint-color-picker-${ramp.id}`}
                  rampId={ramp.id}
                  onPreviewBlendMode={(blendMode) => setPreviewBlendMode(blendMode as BlendMode | undefined)}
                  overlap={true}
                />
              )}
            </div>
            {showTint && (
              <div className="space-y-2 mt-3">
                <LabeledSlider
                  value={ramp.tintOpacity || 0}
                  onChange={opacity => setTintOpacity(ramp.id, opacity)}
                  min={0}
                  max={100}
                  step={1}
                  formatValue={v => `${v}%`}
                  ariaLabel="Tint Opacity"
                />
                <StepSlider
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'darken', label: 'Darken' },
                    { value: 'multiply', label: 'Multiply' },
                    { value: 'plus-darker', label: 'Plus Darker' },
                    { value: 'color-burn', label: 'Color Burn' },
                    { value: 'lighten', label: 'Lighten' },
                    { value: 'screen', label: 'Screen' },
                    { value: 'plus-lighter', label: 'Plus Lighter' },
                    { value: 'color-dodge', label: 'Color Dodge' },
                    { value: 'overlay', label: 'Overlay' },
                    { value: 'soft-light', label: 'Soft Light' },
                    { value: 'hard-light', label: 'Hard Light' },
                    { value: 'difference', label: 'Difference' },
                    { value: 'exclusion', label: 'Exclusion' },
                    { value: 'hue', label: 'Hue' },
                    { value: 'saturation', label: 'Saturation' },
                    { value: 'color', label: 'Color' },
                    { value: 'luminosity', label: 'Luminosity' },
                  ]}
                  value={ramp.tintBlendMode || 'normal'}
                  onChange={mode => setTintBlendMode(ramp.id, mode)}
                  onPreview={mode => {
                    setPreviewBlendMode(mode as BlendMode | undefined);
                    onPreviewBlendMode?.(mode);
                  }}
                  ariaLabel="Blend Mode"
                />
              </div>
            )}
          </div>

          {/* Properties section */}
          <div className="border-t pt-6 flex-1 min-h-0 flex flex-col">
            <HSLPropertiesControl
              ramp={ramp}
              onUpdate={onUpdate}
              onScaleTypeChange={(scaleType) => setColorRampScale(ramp.id, scaleType)}
              previewScaleType={previewScaleType}
              setPreviewScaleType={setPreviewScaleType}
            />
          </div>
        </div>

        {/* Footer toolbar */}
        <Separator />
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHarmonyDialog(true)}>
              <CopyIcon className="w-3.5 h-3.5 mr-1.5" />
              Duplicate
            </Button>
          </div>
          {canDelete && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>

        {/* Harmony Dialog */}
        <Dialog open={showHarmonyDialog} onOpenChange={setShowHarmonyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Ramp</DialogTitle>
              <DialogDescription>Create an exact copy or generate harmony variations.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="justify-between" onClick={() => { duplicateColorRamp(ramp); setShowHarmonyDialog(false); }}>
                <span>Exact Duplicate</span>
                <span className="inline-block w-5 h-5 rounded-full border border-border" style={{ background: ramp.baseColor }} />
              </Button>
              <Separator className="my-2" />
              {([
                { type: 'analogous' as const, label: 'Analogue', colors: getAnalogousColors(ramp.baseColor, 2).slice(1) },
                { type: 'triad' as const, label: 'Triad', colors: getTriadColors(ramp.baseColor).slice(1) },
                { type: 'complementary' as const, label: 'Complementary', colors: getComplementaryColors(ramp.baseColor).slice(1) },
                { type: 'split-complementary' as const, label: 'Split Complementary', colors: getSplitComplementaryColors(ramp.baseColor).slice(1) },
                { type: 'square' as const, label: 'Square', colors: getSquareColors(ramp.baseColor).slice(1) },
                { type: 'compound' as const, label: 'Compound', colors: getCompoundColors(ramp.baseColor).slice(1) },
              ]).map(({ type, label, colors }) => (
                <Button key={type} variant="ghost" className="justify-between" onClick={() => { createHarmonyRamps(ramp, type); setShowHarmonyDialog(false); }}>
                  <span>{label}</span>
                  <span className="inline-flex gap-1">
                    {colors.map((color, i) => (
                      <span key={i} className="inline-block w-5 h-5 rounded-full border border-border" style={{ background: color }} />
                    ))}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default ColorRampControls;
