import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useColorSpaceStore, type ColorSpaceType } from '@/state/ColorSpaceState';
import { generateLinearSpace, generateCubeSpace } from '@/engine/ColorSpaceEngine';
import type { InterpolationMode } from '@/engine/ColorSpaceEngine';
import ColorSpaceViewer3D from './ColorSpaceViewer3D';

const CORNER_LABELS: { key: string; label: string }[] = [
  { key: 'k', label: 'Black (origin)' },
  { key: 'r', label: 'Red (x)' },
  { key: 'g', label: 'Green (y)' },
  { key: 'b', label: 'Blue (z)' },
  { key: 'y', label: 'Yellow (xy)' },
  { key: 'm', label: 'Magenta (xz)' },
  { key: 'c', label: 'Cyan (yz)' },
  { key: 'w', label: 'White (xyz)' },
];

const ColorSpacesSection: React.FC = () => {
  const {
    spaceType,
    linearConfig,
    cubeConfig,
    setSpaceType,
    setLinearConfig,
    setCubeConfig,
  } = useColorSpaceStore();

  /* ─── Palette preview (flat swatch row) ─── */
  const paletteColors = React.useMemo(() => {
    if (spaceType === 'linear') {
      return generateLinearSpace(
        linearConfig.fromColor,
        linearConfig.toColor,
        linearConfig.steps,
        linearConfig.interpolation,
      );
    }
    const keys = Object.keys(cubeConfig.corners);
    const cornerArr = keys.map((k) => cubeConfig.corners[k]) as [string, string, string, string, string, string, string, string];
    return generateCubeSpace(cornerArr, cubeConfig.stepsPerAxis, cubeConfig.interpolation);
  }, [spaceType, linearConfig, cubeConfig]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8 max-w-[1400px] mx-auto">
      {/* ─── Left: controls ─── */}
      <div className="w-full lg:w-[340px] shrink-0 space-y-6">
        {/* Space type selector */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Space Type</Label>
          <Tabs
            value={spaceType}
            onValueChange={(v) => setSpaceType(v as ColorSpaceType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="linear">Linear</TabsTrigger>
              <TabsTrigger value="cube">Cube</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ─── Linear controls ─── */}
        {spaceType === 'linear' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">From Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="color"
                  value={linearConfig.fromColor}
                  onChange={(e) => setLinearConfig({ fromColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border"
                />
                <Input
                  value={linearConfig.fromColor}
                  onChange={(e) => setLinearConfig({ fromColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">To Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="color"
                  value={linearConfig.toColor}
                  onChange={(e) => setLinearConfig({ toColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border"
                />
                <Input
                  value={linearConfig.toColor}
                  onChange={(e) => setLinearConfig({ toColor: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Steps ({linearConfig.steps})</Label>
              <Input
                type="number"
                min={2}
                max={64}
                value={linearConfig.steps}
                onChange={(e) => setLinearConfig({ steps: Math.max(2, Math.min(64, Number(e.target.value))) })}
                className="h-8 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Interpolation</Label>
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

        {/* ─── Cube controls ─── */}
        {spaceType === 'cube' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Steps per Axis ({cubeConfig.stepsPerAxis})</Label>
              <Input
                type="number"
                min={2}
                max={10}
                value={cubeConfig.stepsPerAxis}
                onChange={(e) => setCubeConfig({ stepsPerAxis: Math.max(2, Math.min(10, Number(e.target.value))) })}
                className="h-8 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Interpolation</Label>
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

            {/* Corner colors */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Corner Colors</Label>
              {CORNER_LABELS.map(({ key, label }) => (
                <div key={key} className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={cubeConfig.corners[key]}
                    onChange={(e) =>
                      setCubeConfig({
                        corners: { ...cubeConfig.corners, [key]: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border shrink-0"
                  />
                  <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
                  <Input
                    value={cubeConfig.corners[key]}
                    onChange={(e) =>
                      setCubeConfig({
                        corners: { ...cubeConfig.corners, [key]: e.target.value },
                      })
                    }
                    className="h-6 text-[10px] font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Palette preview strip ─── */}
        <div>
          <Label className="text-xs mb-1 block">
            Palette ({paletteColors.length} colors)
          </Label>
          <div className="flex flex-wrap gap-0.5 max-h-[120px] overflow-y-auto rounded border p-1">
            {paletteColors.map((hex, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm border border-black/10"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: 3D viewer ─── */}
      <div className="flex-1 min-h-[500px]">
        {spaceType === 'linear' ? (
          <ColorSpaceViewer3D
            type="linear"
            fromColor={linearConfig.fromColor}
            toColor={linearConfig.toColor}
            steps={linearConfig.steps}
            interpolation={linearConfig.interpolation}
          />
        ) : (
          <ColorSpaceViewer3D
            type="cube"
            corners={cubeConfig.corners}
            stepsPerAxis={cubeConfig.stepsPerAxis}
            interpolation={cubeConfig.interpolation}
          />
        )}
      </div>
    </div>
  );
};

export default ColorSpacesSection;
