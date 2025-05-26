
import React from 'react';
import { Lock } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  totalSteps: number;
  lightnessRange: number;
  chromaRange: number;
  saturationRange: number;
  lockedColors: { [index: number]: string };
}

interface ColorRampProps {
  config: ColorRampConfig;
  onUpdateConfig: (updates: Partial<ColorRampConfig>) => void;
}

const ColorRamp: React.FC<ColorRampProps> = ({ config, onUpdateConfig }) => {
  const { toast } = useToast();
  const colors = generateColorRamp(config);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color Copied",
      description: `${color} has been copied to your clipboard.`,
    });
  };

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
      // Unlock the color
      delete newLockedColors[index];
    } else {
      // Lock the color
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
          Copy All
        </Button>
      </div>
      
      <div className="flex flex-col gap-1">
        {colors.map((color, index) => {
          const isLocked = config.lockedColors && config.lockedColors[index];
          
          return (
            <div
              key={index}
              className="group relative w-full h-12 rounded-md border border-gray-200 overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: color }}
            >
              {/* Lock button */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-1 right-1 w-6 h-6 p-0 transition-all duration-200 ${
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

              {/* Copy area */}
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => copyColor(color)}
              >
                {/* Copy overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Copy
                  </span>
                </div>

                {/* Color value */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {color}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Click any color to copy • Click lock to freeze
      </div>
    </div>
  );
};

export default ColorRamp;
