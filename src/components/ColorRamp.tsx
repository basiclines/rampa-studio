
import React from 'react';
import { Lock } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const handleColorChange = (index: number, newColor: string) => {
    // Automatically lock the color when manually edited
    const newLockedColors = { ...config.lockedColors };
    newLockedColors[index] = newColor;
    
    onUpdateConfig({ lockedColors: newLockedColors });
    
    toast({
      title: "Color Updated & Locked",
      description: `Color has been changed to ${newColor} and automatically locked.`,
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
            <div key={index} className="space-y-1">
              {/* Color swatch */}
              <div
                className="group relative w-full h-12 rounded-md border border-gray-200 overflow-hidden"
                style={{ backgroundColor: color }}
              >
                {/* Lock button */}
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
              
              {/* Color input field */}
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
                    // Validate hex color format
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
      
      <div className="text-xs text-gray-500 text-center">
        Edit color to lock • Click lock to toggle
      </div>
    </div>
  );
};

export default ColorRamp;
