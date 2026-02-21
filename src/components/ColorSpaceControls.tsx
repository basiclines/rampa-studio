import React from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LabeledSlider from './ui/LabeledSlider';
import { useColorSpaceStore, type ColorSpaceType } from '@/state/ColorSpaceState';
import { generateLinearSpace, generateCubeSpace } from '@/engine/ColorSpaceEngine';
import type { InterpolationMode } from '@/engine/ColorSpaceEngine';

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

interface ColorSpaceControlsProps {
  closeSidebar: () => void;
}

const ColorSpaceControls: React.FC<ColorSpaceControlsProps> = ({ closeSidebar }) => {
  const {
    spaceType,
    linearConfig,
    cubeConfig,
    setSpaceType,
    setLinearConfig,
    setCubeConfig,
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
    const cornerKeys = CORNER_LABELS.map((c) => c.key);
    const cornerArr = cornerKeys.map((k) => cubeConfig.corners[k]) as [string, string, string, string, string, string, string, string];
    return generateCubeSpace(cornerArr, cubeConfig.stepsPerAxis, cubeConfig.interpolation);
  }, [spaceType, linearConfig, cubeConfig]);

  return (
    <div
      className="fixed top-0 left-0 z-40 r-material-light"
      style={{
        width: 332,
        height: '100vh',
        transition: 'width 0.2s',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Close button */}
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <button className="r-close-button" onClick={closeSidebar}>
          <Cross1Icon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-0 flex flex-col">
        <div className="flex gap-4 h-full flex-1">
          <div className="flex-1 flex flex-col h-full min-h-0">
            {/* Space type selector */}
            <div className="pb-6 mb-6 border-b border-gray-200 flex-shrink-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Space Type</div>
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
              <div className="pb-6 mb-6 border-b border-gray-200 flex-shrink-0 space-y-4">
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

                <div className="space-y-2">
                  <Label className="text-xs">Steps</Label>
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
              <div className="pb-6 mb-6 border-b border-gray-200 flex-shrink-0 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Steps per Axis</Label>
                  <LabeledSlider
                    value={cubeConfig.stepsPerAxis}
                    onChange={(value) => setCubeConfig({ stepsPerAxis: Math.round(value) })}
                    min={2}
                    max={10}
                    step={1}
                    formatValue={(v) => `${v}`}
                    ariaLabel="Steps per Axis"
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
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Corner Colors</div>
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
            <div className="flex-shrink-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Palette ({paletteColors.length} colors)
              </div>
              <div className="flex flex-wrap gap-0.5 max-h-[120px] overflow-y-auto rounded p-1" style={{ background: 'var(--r-color-surface-ultrathin)' }}>
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
        </div>
      </div>
    </div>
  );
};

export default ColorSpaceControls;
