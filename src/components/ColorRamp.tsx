
import React from 'react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock } from 'lucide-react';

interface ColorRampConfig {
  id: string;
  name: string;
  baseColor: string;
  stepsUp: number;
  stepsDown: number;
  lightnessRange: number;
  chromaRange: number;
  saturationRange: number;
  lockStepsUp: boolean;
  lockStepsDown: boolean;
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

  const toggleColorLock = (index: number, color: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const lockedColors = { ...config.lockedColors };
    
    if (lockedColors[index]) {
      // Unlock the color
      delete lockedColors[index];
    } else {
      // Lock the color
      lockedColors[index] = color;
    }
    
    onUpdateConfig({ lockedColors });
    
    toast({
      title: lockedColors[index] ? "Color Locked" : "Color Unlocked",
      description: `Color at position ${index + 1} has been ${lockedColors[index] ? 'locked' : 'unlocked'}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700">Color Ramp Preview</h3>
        <Button variant="outline" size="sm" onClick={copyAllColors}>
          Copy All Colors
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {colors.map((color, index) => {
          const isLocked = config.lockedColors && config.lockedColors[index];
          
          return (
            <div
              key={index}
              className="group relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color)}
            >
              {/* Lock button */}
              <button
                onClick={(e) => toggleColorLock(index, color, e)}
                className={`absolute top-1 right-1 p-1 rounded-full transition-all duration-200 z-10 ${
                  isLocked 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>

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
          );
        })}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Click any color to copy its hex value • Click the lock icon to freeze a color
      </div>
    </div>
  );
};

export default ColorRamp;
