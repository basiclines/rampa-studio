
import React, { useMemo, useState } from 'react';
import { Lock, Clipboard } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
  previewBlendMode?: string;
}

const ColorRamp: React.FC<ColorRampProps> = ({ config, onUpdateConfig, previewBlendMode }) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate colors with preview blend mode if provided
  const colors = useMemo(() => {
    if (previewBlendMode && previewBlendMode !== config.tintBlendMode) {
      const previewConfig = {
        ...config,
        tintBlendMode: previewBlendMode as any
      };
      return generateColorRamp(previewConfig);
    }
    return generateColorRamp(config);
  }, [config, previewBlendMode]);

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

  return (
    <div className="space-y-4 min-w-[120px]">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">{config.name}</h3>
        <Button variant="outline" size="sm" onClick={copyAllColors}>
          <Clipboard className="w-4 h-4" />
        </Button>
      </div>
      
      <div 
        className="relative isolate"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Color Ramp */}
        <div className="flex flex-col gap-1">
          {colors.map((color, index) => {
            const isLocked = config.lockedColors && config.lockedColors[index];
            
            return (
              <div key={index} className="relative">
                <div
                  className="group relative w-full h-12 border border-gray-200 overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  {/* Hex value on bottom-right - only visible when hovering the entire ramp */}
                  {isHovered && (
                    <div className="absolute bottom-1 right-1 z-20">
                      <span className="text-xs text-white text-opacity-90 bg-black bg-opacity-50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        {color}
                      </span>
                    </div>
                  )}
                  
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColorRamp;
