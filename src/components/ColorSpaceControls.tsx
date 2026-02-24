import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import LabeledSlider from './ui/LabeledSlider';
import BaseColorSwatch from './BaseColorSwatch';
import { useColorSpaceStore, type ColorSpaceType } from '@/state/ColorSpaceState';
import { generateLinearSpace, generateCubeSpace, generatePlaneSpace } from '@/engine/ColorSpaceEngine';
import type { InterpolationMode } from '@/engine/ColorSpaceEngine';

const CORNER_LABELS: { key: string; label: string }[] = [
  { key: 'k', label: 'Origin' },
  { key: 'r', label: 'X' },
  { key: 'g', label: 'Y' },
  { key: 'b', label: 'Z' },
  { key: 'y', label: 'XY' },
  { key: 'm', label: 'XZ' },
  { key: 'c', label: 'YZ' },
  { key: 'w', label: 'XYZ' },
];

interface ColorSpaceControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ColorSpaceControls: React.FC<ColorSpaceControlsProps> = ({ open, onOpenChange }) => {
  const {
    spaceType,
    linearConfig,
    cubeConfig,
    planeConfig,
    setSpaceType,
    setLinearConfig,
    setCubeConfig,
    setPlaneConfig,
  } = useColorSpaceStore();

  /* ─── Palette preview ─── */
  const paletteColors = React.useMemo(() => {
    if (spaceType === 'linear') {
      return generateLinearSpace(
        linearConfig.fromColor,
        linearConfig.toColor,
        linearConfig.steps,
        linearConfig.interpolation,
      );
    }
    if (spaceType === 'plane') {
      return generatePlaneSpace(
        planeConfig.dark,
        planeConfig.light,
        planeConfig.hue,
        planeConfig.stepsPerAxis,
        planeConfig.interpolation,
      );
    }
    const cornerKeys = CORNER_LABELS.map((c) => c.key);
    const cornerArr = cornerKeys.map((k) => cubeConfig.corners[k]) as [string, string, string, string, string, string, string, string];
    return generateCubeSpace(cornerArr, cubeConfig.stepsPerAxis, cubeConfig.interpolation);
  }, [spaceType, linearConfig, cubeConfig, planeConfig]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="left" className="flex flex-col overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Color Space Settings</SheetTitle>
          <SheetDescription className="sr-only">Configure color space properties</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 pt-10 flex-1 min-h-0">
          {/* Space type selector */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Space Type</div>
            <Tabs
              value={spaceType}
              onValueChange={(v) => setSpaceType(v as ColorSpaceType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="linear">Linear</TabsTrigger>
                <TabsTrigger value="plane">Plane</TabsTrigger>
                <TabsTrigger value="cube">Cube</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Linear controls */}
          {spaceType === 'linear' && (
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</div>
                <LabeledSlider
                  value={linearConfig.steps}
                  onChange={(value) => setLinearConfig({ steps: Math.round(value) })}
                  min={2}
                  max={64}
                  step={1}
                  formatValue={(v) => `${v}`}
                  ariaLabel="Steps"
                />
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</div>
                <div className="grid grid-cols-2 gap-x-1 gap-y-6">
                  {([
                    { key: 'from', label: 'From', color: linearConfig.fromColor, set: (c: string) => setLinearConfig({ fromColor: c }) },
                    { key: 'to', label: 'To', color: linearConfig.toColor, set: (c: string) => setLinearConfig({ toColor: c }) },
                  ] as const).map(({ key, label, color, set }, index) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="relative" style={{ width: 56, height: 68 }}>
                        <BaseColorSwatch
                          color={color}
                          colorFormat="hex"
                          onChange={set}
                          size={48}
                          pickerAlign={index >= 1 ? 'right' : 'left'}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interpolation</div>
                <Select
                  value={linearConfig.interpolation}
                  onValueChange={(v) => setLinearConfig({ interpolation: v as InterpolationMode })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oklch">OKLCH</SelectItem>
                    <SelectItem value="lab">LAB</SelectItem>
                    <SelectItem value="rgb">RGB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Cube controls */}
          {spaceType === 'cube' && (
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</div>
                <LabeledSlider
                  value={cubeConfig.stepsPerAxis}
                  onChange={(value) => setCubeConfig({ stepsPerAxis: Math.round(value) })}
                  min={2}
                  max={20}
                  step={1}
                  formatValue={(v) => `${v}`}
                  ariaLabel="Steps"
                />
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</div>
                <div className="grid grid-cols-4 gap-x-1 gap-y-6">
                  {CORNER_LABELS.map(({ key, label }, index) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="relative" style={{ width: 56, height: 68 }}>
                        <BaseColorSwatch
                          color={cubeConfig.corners[key]}
                          colorFormat="hex"
                          onChange={(c) =>
                            setCubeConfig({
                              corners: { ...cubeConfig.corners, [key]: c },
                            })
                          }
                          size={48}
                          pickerAlign={index % 4 >= 2 ? 'right' : 'left'}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interpolation</div>
                <Select
                  value={cubeConfig.interpolation}
                  onValueChange={(v) => setCubeConfig({ interpolation: v as InterpolationMode })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oklch">OKLCH</SelectItem>
                    <SelectItem value="lab">LAB</SelectItem>
                    <SelectItem value="rgb">RGB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Plane controls */}
          {spaceType === 'plane' && (
            <div className="border-t pt-6 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</div>
                <LabeledSlider
                  value={planeConfig.stepsPerAxis}
                  onChange={(value) => setPlaneConfig({ stepsPerAxis: Math.round(value) })}
                  min={2}
                  max={20}
                  step={1}
                  formatValue={(v) => `${v}`}
                  ariaLabel="Steps"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</div>
                <div className="grid grid-cols-3 gap-x-1 gap-y-6">
                  {([
                    { key: 'dark', label: 'Dark', color: planeConfig.dark, set: (c: string) => setPlaneConfig({ dark: c }) },
                    { key: 'light', label: 'Light', color: planeConfig.light, set: (c: string) => setPlaneConfig({ light: c }) },
                    { key: 'hue', label: 'Hue', color: planeConfig.hue, set: (c: string) => setPlaneConfig({ hue: c }) },
                  ] as const).map(({ key, label, color, set }, index) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="relative" style={{ width: 56, height: 68 }}>
                        <BaseColorSwatch
                          color={color}
                          colorFormat="hex"
                          onChange={set}
                          size={48}
                          pickerAlign={index >= 2 ? 'right' : 'left'}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interpolation</div>
                <Select
                  value={planeConfig.interpolation}
                  onValueChange={(v) => setPlaneConfig({ interpolation: v as InterpolationMode })}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oklch">OKLCH</SelectItem>
                    <SelectItem value="lab">LAB</SelectItem>
                    <SelectItem value="rgb">RGB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Palette preview strip */}
          <div className="min-h-0 flex-1 flex flex-col">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Palette ({paletteColors.length} colors)
            </div>
            <div className="flex flex-wrap gap-0.5 overflow-y-auto rounded p-1 bg-muted content-start">
              {paletteColors.map((hex, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm border border-border"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ColorSpaceControls;
