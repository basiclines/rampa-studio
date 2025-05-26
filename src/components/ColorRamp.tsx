import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import GradientControl from './GradientControl';
import chroma from 'chroma-js';

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

interface ColorRampProps {
  config: ColorRampConfig;
  onUpdateConfig: (updates: Partial<ColorRampConfig>) => void;
}

const ColorRamp: React.FC<ColorRampProps> = ({ config, onUpdateConfig }) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const colors = generateColorRamp(config);

  const copyAllColors = () => {
    const colorString = colors.join('\n');
    navigator.clipboard.writeText(colorString);
    toast({
      title: "All Colors Copied",
      description: `${colors.length} colors have been copied to your clipboard.`,
    });
  };

  const toggleLockColor = (index: number, color: string) => {
    const newLockedColors = { ...config.lockedColors };
    
    if (newLockedColors[index]) {
      delete newLockedColors[index];
    } else {
      newLockedColors[index] = color;
    }
    
    onUpdateConfig({ lockedColors: newLockedColors });
    
    toast({
      title: newLockedColors[index] ? "Color Locked" : "Color Unlocked",
      description: `Color ${color} has been ${newLockedColors[index] ? 'locked' : 'unlocked'}.`,
    });
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newLockedColors = { ...config.lockedColors };
    newLockedColors[index] = newColor;
    
    onUpdateConfig({ lockedColors: newLockedColors });
    
    toast({
      title: "Color Updated & Locked",
      description: `Color has been changed to ${newColor} and automatically locked.`,
    });
  };

  const handleLightnessGradient = (start: number, end: number) => {
    onUpdateConfig({
      lightnessAdvanced: true,
      lightnessStart: start,
      lightnessEnd: end
    });
  };

  const handleHueGradient = (start: number, end: number) => {
    onUpdateConfig({
      chromaAdvanced: true,
      chromaStart: start,
      chromaEnd: end
    });
  };

  const handleSaturationGradient = (start: number, end: number) => {
    onUpdateConfig({
      saturationAdvanced: true,
      saturationStart: start,
      saturationEnd: end
    });
  };

  // Generate gradient colors for each parameter - memoized and only dependent on base color
  const parameterGradients = useMemo(() => {
    const generateParameterGradient = (parameter: 'lightness' | 'hue' | 'saturation') => {
      const gradientSteps = 20;
      const gradientColors: string[] = [];
      
      try {
        const baseColor = chroma(config.baseColor);
        const [h, s, l] = baseColor.hsl();
        
        for (let i = 0; i < gradientSteps; i++) {
          const position = i / (gradientSteps - 1);
          let newColor;
          
          switch (parameter) {
            case 'lightness': {
              // Full lightness spectrum from 0% to 100%
              const lightness = position;
              newColor = chroma.hsl(h || 0, s || 0, lightness);
              break;
            }
            case 'hue': {
              // Full hue spectrum from -180° to +180° relative to base hue
              const hueShift = -180 + (360 * position);
              const hue = (h || 0) + hueShift;
              newColor = chroma.hsl(hue, s || 0, l || 0.5);
              break;
            }
            case 'saturation': {
              // Full saturation spectrum from 0% to 100%
              const saturation = position;
              newColor = chroma.hsl(h || 0, saturation, l || 0.5);
              break;
            }
          }
          
          gradientColors.push(newColor.hex());
        }
      } catch (error) {
        console.error('Error generating parameter gradient:', error);
        // Fallback to gray gradient
        for (let i = 0; i < gradientSteps; i++) {
          const lightness = i / (gradientSteps - 1);
          gradientColors.push(chroma.hsl(0, 0, lightness).hex());
        }
      }
      
      return gradientColors;
    };

    return {
      lightness: generateParameterGradient('lightness'),
      hue: generateParameterGradient('hue'),
      saturation: generateParameterGradient('saturation')
    };
  }, [config.baseColor]);

  // Get base color hue for reference line
  const baseColorHue = useMemo(() => {
    try {
      const baseColor = chroma(config.baseColor);
      const [h] = baseColor.hsl();
      return h || 0;
    } catch (error) {
      console.error('Error getting base color hue:', error);
      return 0;
    }
  }, [config.baseColor]);

  return (
    <div className="space-y-4 min-w-[120px]">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">{config.name}</h3>
        <Button variant="outline" size="sm" onClick={copyAllColors}>
          Copy All
        </Button>
      </div>
      
      <div 
        className="relative isolate"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ zIndex: isHovered ? 1000 : 1 }}
      >
        {/* Color Ramp */}
        <div className="flex flex-col gap-1">
          {colors.map((color, index) => {
            const isLocked = config.lockedColors && config.lockedColors[index];
            
            return (
              <div key={index} className="space-y-1">
                <div
                  className="group relative w-full h-12 rounded-md border border-gray-200 overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-1 right-1 w-6 h-6 p-0 transition-all duration-200 z-10 ${
                      isLocked 
                        ? 'bg-black bg-opacity-60 text-yellow-400 opacity-100' 
                        : 'bg-black bg-opacity-0 text-white opacity-0 group-hover:opacity-100 group-hover:bg-opacity-60'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLockColor(index, color);
                    }}
                  >
                    <Lock className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex gap-1 items-center">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-8 h-6 border border-gray-300 rounded cursor-pointer p-0"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      if (/^#[0-9A-F]{6}$/i.test(newColor) || /^#[0-9A-F]{3}$/i.test(newColor)) {
                        handleColorChange(index, newColor);
                      }
                    }}
                    className="flex-1 text-xs h-6"
                    placeholder="#000000"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Gradient Controls - Positioned right next to the ramp */}
        {isHovered && (config.lightnessAdvanced || config.chromaAdvanced || config.saturationAdvanced) && (
          <div 
            className="absolute left-full top-0 bottom-0 flex gap-2 transition-all duration-200 animate-fade-in bg-white border border-gray-200 rounded-lg shadow-lg p-3 ml-0"
            style={{ zIndex: 1001 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {config.lightnessAdvanced && (
              <GradientControl
                label="Lightness"
                startValue={config.lightnessStart ?? 10}
                endValue={config.lightnessEnd ?? 90}
                min={0}
                max={100}
                onValuesChange={handleLightnessGradient}
                formatValue={(v) => `${Math.round(v)}%`}
                gradientColors={parameterGradients.lightness}
              />
            )}
            
            {config.chromaAdvanced && (
              <GradientControl
                label="Hue"
                startValue={config.chromaStart ?? -30}
                endValue={config.chromaEnd ?? 30}
                min={-180}
                max={180}
                onValuesChange={handleHueGradient}
                formatValue={(v) => `${Math.round(v)}°`}
                gradientColors={parameterGradients.hue}
                referenceValue={0} // Base hue is at 0 position (no shift)
              />
            )}
            
            {config.saturationAdvanced && (
              <GradientControl
                label="Saturation"
                startValue={config.saturationStart ?? 20}
                endValue={config.saturationEnd ?? 80}
                min={0}
                max={100}
                onValuesChange={handleSaturationGradient}
                formatValue={(v) => `${Math.round(v)}%`}
                gradientColors={parameterGradients.saturation}
              />
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        {isHovered && (config.lightnessAdvanced || config.chromaAdvanced || config.saturationAdvanced) ? (
          "Drag gradient controls • Edit color to lock • Click lock to toggle"
        ) : (
          "Hover to show gradient controls • Edit color to lock • Click lock to toggle"
        )}
      </div>
    </div>
  );
};

export default ColorRamp;
