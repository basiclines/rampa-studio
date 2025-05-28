import React, { useMemo, useState } from 'react';
import { Lock, Clipboard, Copy, Trash2 } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ColorRampConfig } from '@/types/colorRamp';
import { Input } from '@/components/ui/input';

interface ColorRampProps {
  config: ColorRampConfig;
  onUpdateConfig: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  previewBlendMode?: string;
  isSelected?: boolean;
}

const ColorRamp: React.FC<ColorRampProps> = ({ 
  config, 
  onUpdateConfig, 
  onDuplicate,
  onDelete,
  previewBlendMode, 
  isSelected = false 
}) => {
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

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.();
    toast({
      title: "Color Ramp Duplicated",
      description: `${config.name} has been duplicated.`,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    toast({
      title: "Color Ramp Deleted",
      description: `${config.name} has been deleted.`,
    });
  };

  return (
    <div 
      className={`space-y-4 min-w-[120px] cursor-pointer transition-all duration-300 p-3 rounded-lg relative ${
        isSelected 
          ? 'bg-blue-50 ring-2 ring-blue-200 shadow-lg' 
          : 'hover:bg-gray-50 hover:shadow-md hover:scale-105'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-30 flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyAllColors}
            className="h-8 w-8 p-0 bg-white shadow-md"
          >
            <Clipboard className="w-3 h-3" />
          </Button>
          {onDuplicate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDuplicate}
              className="h-8 w-8 p-0 bg-white shadow-md"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="h-8 w-8 p-0 bg-white shadow-md hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      <div className="text-center space-y-2">
        {isSelected ? (
          <Input
            value={config.name}
            onChange={e => onUpdateConfig({ name: e.target.value })}
            className="border border-gray-200 p-2 text-lg font-semibold bg-white focus-visible:ring-2 focus-visible:ring-blue-500 text-center"
            placeholder="Color ramp name"
            autoFocus
          />
        ) : (
          <h3 className={`text-lg font-medium transition-colors ${
            isSelected ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {config.name}
          </h3>
        )}
      </div>
      
      <div className="relative isolate">
        {/* Color Ramp */}
        <div className="flex flex-col gap-1">
          {colors.map((color, index) => {
            const isLocked = config.lockedColors && config.lockedColors[index];
            
            return (
              <div key={index} className="relative">
                <div
                  className="group relative w-full h-12 border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300"
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
