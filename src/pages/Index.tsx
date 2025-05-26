
import React, { useState, useCallback } from 'react';
import { Plus, Download, Trash2, Copy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ColorRamp from '@/components/ColorRamp';
import { generateColorRamp, exportToSvg } from '@/lib/colorUtils';
import { useToast } from '@/hooks/use-toast';

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
  lockedColors: { [index: number]: string };
}

const Index = () => {
  const { toast } = useToast();
  const [colorRamps, setColorRamps] = useState<ColorRampConfig[]>([
    {
      id: '1',
      name: 'Primary',
      baseColor: '#3b82f6',
      totalSteps: 11,
      lightnessRange: 80,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 40,
      saturationAdvanced: false,
      lockedColors: {},
    },
    {
      id: '2',
      name: 'Secondary',
      baseColor: '#10b981',
      totalSteps: 9,
      lightnessRange: 70,
      lightnessAdvanced: false,
      chromaRange: 15,
      chromaAdvanced: false,
      saturationRange: 30,
      saturationAdvanced: false,
      lockedColors: {},
    },
  ]);

  const addColorRamp = useCallback(() => {
    const newRamp: ColorRampConfig = {
      id: Date.now().toString(),
      name: `Ramp ${colorRamps.length + 1}`,
      baseColor: '#6366f1',
      totalSteps: 11,
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
      lockedColors: {},
    };
    setColorRamps(prev => [...prev, newRamp]);
  }, [colorRamps.length]);

  const duplicateColorRamp = useCallback((ramp: ColorRampConfig) => {
    const duplicatedRamp: ColorRampConfig = {
      ...ramp,
      id: Date.now().toString(),
      name: `${ramp.name} Copy`,
    };
    setColorRamps(prev => [...prev, duplicatedRamp]);
  }, []);

  const removeColorRamp = useCallback((id: string) => {
    setColorRamps(prev => prev.filter(ramp => ramp.id !== id));
  }, []);

  const updateColorRamp = useCallback((id: string, updates: Partial<ColorRampConfig>) => {
    setColorRamps(prev => prev.map(ramp => 
      ramp.id === id ? { ...ramp, ...updates } : ramp
    ));
  }, []);

  const handleExportSvg = useCallback(() => {
    try {
      const allColors = colorRamps.map(ramp => ({
        name: ramp.name,
        colors: generateColorRamp(ramp),
      }));
      
      const svgContent = exportToSvg(allColors);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'color-palette.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "SVG Exported",
        description: "Your color palette has been downloaded as an SVG file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your palette.",
        variant: "destructive",
      });
    }
  }, [colorRamps, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Color Palette Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create and edit multiple color ramps with precise control over lightness, hue shifts, and saturation
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={addColorRamp} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Color Ramp
          </Button>
          <Button onClick={handleExportSvg} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export SVG
          </Button>
        </div>

        {/* Layout with Controls and Color Ramps */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {colorRamps.map((ramp) => (
              <Card key={ramp.id} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      <Input
                        value={ramp.name}
                        onChange={(e) => updateColorRamp(ramp.id, { name: e.target.value })}
                        className="border-none p-0 text-xl font-semibold bg-transparent focus-visible:ring-0"
                      />
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateColorRamp(ramp)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {colorRamps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColorRamp(ramp.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Base Color and Steps */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`base-color-${ramp.id}`}>Base Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`base-color-${ramp.id}`}
                          type="color"
                          value={ramp.baseColor}
                          onChange={(e) => updateColorRamp(ramp.id, { baseColor: e.target.value })}
                          className="w-16 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={ramp.baseColor}
                          onChange={(e) => updateColorRamp(ramp.id, { baseColor: e.target.value })}
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
                          onValueChange={([value]) => updateColorRamp(ramp.id, { totalSteps: value })}
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
                            updateColorRamp(ramp.id, { totalSteps: value });
                          }}
                          min={3}
                          max={21}
                          className="w-16 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Adjustment Controls */}
                  <div className="space-y-4">
                    {/* Lightness Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {ramp.lightnessAdvanced ? 'Lightness Range' : `Lightness Range: ${ramp.lightnessRange}%`}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updates: Partial<ColorRampConfig> = { lightnessAdvanced: !ramp.lightnessAdvanced };
                            if (!ramp.lightnessAdvanced) {
                              // Set default start/end values when enabling advanced mode (as percentages)
                              updates.lightnessStart = 10;
                              updates.lightnessEnd = 90;
                            }
                            updateColorRamp(ramp.id, updates);
                          }}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {ramp.lightnessAdvanced ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start (%)</Label>
                            <Input
                              type="number"
                              value={ramp.lightnessStart || 10}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 10));
                                updateColorRamp(ramp.id, { lightnessStart: value });
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="text-center text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End (%)</Label>
                            <Input
                              type="number"
                              value={ramp.lightnessEnd || 90}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 90));
                                updateColorRamp(ramp.id, { lightnessEnd: value });
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="text-center text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Slider
                            value={[ramp.lightnessRange]}
                            onValueChange={([value]) => updateColorRamp(ramp.id, { lightnessRange: value })}
                            max={100}
                            min={0}
                            step={0.5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={ramp.lightnessRange}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              updateColorRamp(ramp.id, { lightnessRange: value });
                            }}
                            min={0}
                            max={100}
                            step={0.5}
                            className="w-16 text-center"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Hue Shift Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {ramp.chromaAdvanced ? 'Hue Range' : `Hue Shift: ${ramp.chromaRange}°`}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updates: Partial<ColorRampConfig> = { chromaAdvanced: !ramp.chromaAdvanced };
                            if (!ramp.chromaAdvanced) {
                              // Set default start/end values when enabling advanced mode
                              updates.chromaStart = -30;
                              updates.chromaEnd = 30;
                            }
                            updateColorRamp(ramp.id, updates);
                          }}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {ramp.chromaAdvanced ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start</Label>
                            <Input
                              type="number"
                              value={ramp.chromaStart ?? -30}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  updateColorRamp(ramp.id, { chromaStart: value });
                                }
                              }}
                              className="text-center text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End</Label>
                            <Input
                              type="number"
                              value={ramp.chromaEnd ?? 30}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  updateColorRamp(ramp.id, { chromaEnd: value });
                                }
                              }}
                              className="text-center text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Slider
                            value={[ramp.chromaRange]}
                            onValueChange={([value]) => updateColorRamp(ramp.id, { chromaRange: value })}
                            max={180}
                            min={-180}
                            step={0.5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={ramp.chromaRange}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= -180 && value <= 180) {
                                updateColorRamp(ramp.id, { chromaRange: value });
                              }
                            }}
                            min={-180}
                            max={180}
                            step={0.5}
                            className="w-16 text-center"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Saturation Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {ramp.saturationAdvanced ? 'Saturation Range' : `Saturation Range: ${ramp.saturationRange}%`}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updates: Partial<ColorRampConfig> = { saturationAdvanced: !ramp.saturationAdvanced };
                            if (!ramp.saturationAdvanced) {
                              // Set default start/end values when enabling advanced mode (as percentages)
                              updates.saturationStart = 20;
                              updates.saturationEnd = 80;
                            }
                            updateColorRamp(ramp.id, updates);
                          }}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {ramp.saturationAdvanced ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start (%)</Label>
                            <Input
                              type="number"
                              value={ramp.saturationStart || 20}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 20));
                                updateColorRamp(ramp.id, { saturationStart: value });
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="text-center text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End (%)</Label>
                            <Input
                              type="number"
                              value={ramp.saturationEnd || 80}
                              onChange={(e) => {
                                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 80));
                                updateColorRamp(ramp.id, { saturationEnd: value });
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="text-center text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Slider
                            value={[ramp.saturationRange]}
                            onValueChange={([value]) => updateColorRamp(ramp.id, { saturationRange: value })}
                            max={100}
                            min={0}
                            step={0.5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={ramp.saturationRange}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              updateColorRamp(ramp.id, { saturationRange: value });
                            }}
                            min={0}
                            max={100}
                            step={0.5}
                            className="w-16 text-center"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Color Ramps Display */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Color Ramps Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {colorRamps.map((ramp) => (
                    <ColorRamp 
                      key={ramp.id}
                      config={ramp} 
                      onUpdateConfig={(updates) => updateColorRamp(ramp.id, updates)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
