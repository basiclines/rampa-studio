import React, { useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ColorRamp from '@/components/ColorRamp';
import ColorRampControls from '@/components/ColorRampControls';
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
  tintColor?: string;
  tintOpacity?: number;
  tintBlendMode?: 'normal' | 'multiply' | 'overlay';
  lockedColors: { [index: number]: string };
}

const Index = () => {
  const { toast } = useToast();
  const [previewBlendModes, setPreviewBlendModes] = useState<{ [rampId: string]: string | undefined }>({});
  const [colorRamps, setColorRamps] = useState<ColorRampConfig[]>([
    {
      id: '1',
      name: 'Primary',
      baseColor: '#3b82f6',
      totalSteps: 10,
      lightnessRange: 80,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 40,
      saturationAdvanced: false,
      tintColor: '#000000',
      tintOpacity: 0,
      lockedColors: {},
    },
  ]);

  const addColorRamp = useCallback(() => {
    const newRamp: ColorRampConfig = {
      id: Date.now().toString(),
      name: `Ramp ${colorRamps.length + 1}`,
      baseColor: '#6366f1',
      totalSteps: 10,
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
      tintColor: '#000000',
      tintOpacity: 0,
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
      navigator.clipboard.writeText(svgContent);
      
      toast({
        title: "Color ramps in the clipboard",
        description: "Now just paste them in Figma",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "There was an error copying your palette.",
        variant: "destructive",
      });
    }
  }, [colorRamps, toast]);

  const handlePreviewBlendMode = useCallback((rampId: string, blendMode: string | undefined) => {
    setPreviewBlendModes(prev => ({
      ...prev,
      [rampId]: blendMode
    }));
  }, []);

  // Check if any ramp has advanced mode enabled
  const hasAdvancedMode = colorRamps.some(ramp => 
    ramp.lightnessAdvanced || ramp.chromaAdvanced || ramp.saturationAdvanced
  );

  // Calculate sidebar width based on advanced mode usage
  const sidebarWidth = hasAdvancedMode ? 'w-[600px]' : 'w-80';

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Export Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleExportSvg} variant="outline" className="gap-2 bg-white shadow-md">
          <Download className="w-4 h-4" />
          Export to Figma
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarWidth} bg-white border-r border-gray-200 transition-all duration-300`}>
        <ScrollArea className="h-screen">
          <div className="p-6">
            {/* Configuration Controls */}
            <div className="space-y-8">
              {colorRamps.map((ramp, index) => (
                <div key={ramp.id}>
                  {index > 0 && <Separator className="mb-8" />}
                  <ColorRampControls
                    ramp={ramp}
                    canDelete={colorRamps.length > 1}
                    onUpdate={(updates) => updateColorRamp(ramp.id, updates)}
                    onDuplicate={() => duplicateColorRamp(ramp)}
                    onDelete={() => removeColorRamp(ramp.id)}
                    onPreviewBlendMode={(blendMode) => handlePreviewBlendMode(ramp.id, blendMode)}
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-none">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Color Ramps Preview
            </h2>
            <p className="text-gray-600">
              Preview and compare your color ramps
            </p>
          </div>
          
          <div className="flex gap-6 items-start overflow-x-auto pb-4">
            {colorRamps.map((ramp) => (
              <ColorRamp 
                key={ramp.id}
                config={ramp} 
                onUpdateConfig={(updates) => updateColorRamp(ramp.id, updates)}
                previewBlendMode={previewBlendModes[ramp.id]}
              />
            ))}
            
            {/* Add Color Ramp Button */}
            <Button 
              onClick={addColorRamp} 
              variant="outline" 
              size="icon"
              className="w-12 h-12 rounded-full bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
