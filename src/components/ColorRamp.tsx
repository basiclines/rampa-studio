
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
                {/* Hex value on top - only visible when hovering the entire ramp */}
                {isHovered && (
                  <div className="absolute -top-6 left-0 right-0 text-center z-20">
                    <span className="text-xs text-gray-600 bg-white px-1 rounded shadow-sm">
                      {color}
                    </span>
                  </div>
                )}
                
                <div
                  className="group relative w-full h-12 border border-gray-200 overflow-hidden"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ColorRamp;
