import React, { useMemo, useState } from 'react';
import { generateColorRamp } from '@/engine/ColorEngine';
import { Card } from '@/components/ui/card';
import { ColorRampConfig } from '@/entities/ColorRampEntity';

interface ColorRampProps {
  config: ColorRampConfig;
  onUpdateConfig: (updates: Partial<ColorRampConfig>) => void;
  previewBlendMode?: string;
  isSelected?: boolean;
  onColorClick?: (color: string) => void;
}

const ColorRamp: React.FC<ColorRampProps> = ({ 
  config, 
  onUpdateConfig, 
  previewBlendMode, 
  isSelected = false,
  onColorClick,
}) => {
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

  return (
    <Card
      className="flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300 h-full"
      style={{
        width: 240,
        minWidth: 200,
        maxWidth: 320,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Ramp */}
      <div className="flex flex-col gap-0 h-full">
        {colors.map((color, index) => (
          <div key={index} className="relative flex-1 min-h-0">
            <div
              className="group relative w-full h-full overflow-hidden transition-all duration-200 flex items-stretch cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={(e) => {
                if (isSelected) {
                  e.stopPropagation();
                  onColorClick?.(color);
                }
              }}
            >
              {(isHovered || isSelected) && (
                <div className="absolute bottom-1 right-1 z-20">
                  <span className="text-xs text-white text-opacity-90 bg-black bg-opacity-50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    {color}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ColorRamp;
