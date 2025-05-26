
import React, { useState, useCallback } from 'react';
import { Plus, Download, Trash2 } from 'lucide-react';
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
  stepsUp: number;
  stepsDown: number;
  lightnessRange: number;
  chromaRange: number;
  saturationRange: number;
}

const Index = () => {
  const { toast } = useToast();
  const [colorRamps, setColorRamps] = useState<ColorRampConfig[]>([
    {
      id: '1',
      name: 'Primary',
      baseColor: '#3b82f6',
      stepsUp: 5,
      stepsDown: 5,
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
    },
    {
      id: '2',
      name: 'Secondary',
      baseColor: '#10b981',
      stepsUp: 4,
      stepsDown: 4,
      lightnessRange: 70,
      chromaRange: 50,
      saturationRange: 30,
    },
  ]);

  const addColorRamp = useCallback(() => {
    const newRamp: ColorRampConfig = {
      id: Date.now().toString(),
      name: `Ramp ${colorRamps.length + 1}`,
      baseColor: '#6366f1',
      stepsUp: 5,
      stepsDown: 5,
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
    };
    setColorRamps(prev => [...prev, newRamp]);
  }, [colorRamps.length]);

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
            Create and edit multiple color ramps with precise control over lightness, chroma, and saturation
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

        {/* Color Ramps */}
        <div className="grid gap-8">
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
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base Color and Steps */}
                <div className="grid md:grid-cols-3 gap-6">
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
                    <Label>Steps Up: {ramp.stepsUp}</Label>
                    <Slider
                      value={[ramp.stepsUp]}
                      onValueChange={([value]) => updateColorRamp(ramp.id, { stepsUp: value })}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Steps Down: {ramp.stepsDown}</Label>
                    <Slider
                      value={[ramp.stepsDown]}
                      onValueChange={([value]) => updateColorRamp(ramp.id, { stepsDown: value })}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Color Adjustment Controls */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Lightness Range: {ramp.lightnessRange}%</Label>
                    <Slider
                      value={[ramp.lightnessRange]}
                      onValueChange={([value]) => updateColorRamp(ramp.id, { lightnessRange: value })}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Chroma Range: {ramp.chromaRange}%</Label>
                    <Slider
                      value={[ramp.chromaRange]}
                      onValueChange={([value]) => updateColorRamp(ramp.id, { chromaRange: value })}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Saturation Range: {ramp.saturationRange}%</Label>
                    <Slider
                      value={[ramp.saturationRange]}
                      onValueChange={([value]) => updateColorRamp(ramp.id, { saturationRange: value })}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Color Ramp Preview */}
                <ColorRamp config={ramp} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
