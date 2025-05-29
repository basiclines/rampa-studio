import React, { useMemo, useState } from 'react';
import { Lock, Clipboard, Copy, Trash2, Plus } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ColorRampConfig } from '@/types/colorRamp';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  getAnalogousColors,
  getTriadColors,
  getComplementaryColors,
  getSplitComplementaryColors,
  getSquareColors,
  getCompoundColors,
} from '@/lib/colorUtils';

interface ColorRampProps {
  config: ColorRampConfig;
  onUpdateConfig: (updates: Partial<ColorRampConfig>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  previewBlendMode?: string;
  isSelected?: boolean;
  colorRamps: ColorRampConfig[];
  setColorRamps: React.Dispatch<React.SetStateAction<ColorRampConfig[]>>;
}

const ColorRamp: React.FC<ColorRampProps> = ({ 
  config, 
  onUpdateConfig, 
  onDuplicate,
  onDelete,
  previewBlendMode, 
  isSelected = false,
  colorRamps,
  setColorRamps
}) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
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
      className={`space-y-4 flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg relative
        ${isSelected ? 'bg-blue-50 ring-2 ring-blue-200 shadow-lg' : 'hover:bg-gray-50 hover:shadow-md'}
      `}
      style={{
        padding: 0,
        boxSizing: 'border-box',
        height: 'calc(100vh - 96px)',
        margin: 0,
        maxHeight: 'calc(100vh - 96px)',
        width: 240,
        minWidth: 200,
        maxWidth: 320,
        transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Actions */}
      <div className="pointer-events-none">
        {isHovered && (
          <div className="absolute top-2 right-2 z-30 flex gap-1 pointer-events-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyAllColors}
              className="h-8 w-8 p-0 bg-white shadow-md"
              style={{ pointerEvents: 'auto' }}
            >
              <Clipboard className="w-3 h-3" />
            </Button>
            {onDuplicate && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDuplicate}
                className="h-8 w-8 p-0 bg-white shadow-md"
                style={{ pointerEvents: 'auto' }}
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
                style={{ pointerEvents: 'auto' }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
            {/* Add Color Ramp Button (Dropdown, open on hover) */}
            <div
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
              style={{ display: 'inline-block' }}
            >
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 p-0 bg-white shadow-md border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    aria-label="Add color ramp"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getAnalogousColors(last.baseColor, 2).slice(1); // +1
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-a' + i,
                          name: `Analogue ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Analogue</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getAnalogousColors(config.baseColor, 2).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getAnalogousColors(config.baseColor, 2).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getTriadColors(last.baseColor).slice(1); // +2
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-t' + i,
                          name: `Triad ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Triade</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getTriadColors(config.baseColor).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getTriadColors(config.baseColor).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getComplementaryColors(last.baseColor).slice(1); // +1
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-c' + i,
                          name: `Complementary ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Complementary</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getComplementaryColors(config.baseColor).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getComplementaryColors(config.baseColor).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getSplitComplementaryColors(last.baseColor).slice(1); // +2
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-sc' + i,
                          name: `Split Comp. ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Split Complementary</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getSplitComplementaryColors(config.baseColor).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getSplitComplementaryColors(config.baseColor).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getSquareColors(last.baseColor).slice(1); // +3
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-sq' + i,
                          name: `Square ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Square</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getSquareColors(config.baseColor).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getSquareColors(config.baseColor).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const last = config;
                      const bases = getCompoundColors(last.baseColor).slice(1); // +3
                      setColorRamps(prev => {
                        const idx = prev.findIndex(r => r.id === config.id);
                        const newRamps = bases.map((base, i) => ({
                          ...last,
                          id: Date.now().toString() + '-cp' + i,
                          name: `Compound ${i + 1}`,
                          baseColor: base,
                          lockedColors: {},
                        }));
                        return [
                          ...prev.slice(0, idx + 1),
                          ...newRamps,
                          ...prev.slice(idx + 1),
                        ];
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Compound</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getCompoundColors(config.baseColor).slice(1).map((color, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: color,
                            marginRight: i !== getCompoundColors(config.baseColor).slice(1).length - 1 ? 4 : 0,
                            border: '1.5px solid #e5e7eb',
                          }} />
                        ))}
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2" style={{ paddingTop: 24, paddingLeft: 24, paddingRight: 24 }}>
        {isSelected ? (
          <div
            className="relative"
            onMouseEnter={() => setIsEditing(true)}
            onMouseLeave={() => setIsEditing(false)}
          >
            <Input
              value={config.name}
              onChange={e => onUpdateConfig({ name: e.target.value })}
              className={`text-lg font-semibold text-center transition-all duration-150
                ${isEditing ? 'border border-gray-200 p-2 bg-white focus-visible:ring-2 focus-visible:ring-blue-500' : 'border-none bg-transparent p-0 focus-visible:ring-0 cursor-pointer'}`}
              placeholder="Color ramp name"
              spellCheck={false}
              tabIndex={0}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <h3 className={`text-lg font-medium transition-colors ${
            isSelected ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {config.name}
          </h3>
        )}
      </div>
      
      <div className="relative isolate" style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24, height: 'calc(100% - 56px)' }}>
        {/* Color Ramp */}
        <div className="flex flex-col gap-1" style={{ height: '100%' }}>
          {colors.map((color, index) => {
            const isLocked = config.lockedColors && config.lockedColors[index];
            return (
              <div key={index} className="relative flex-1 min-h-0">
                <div
                  className="group relative w-full h-full border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300 flex items-stretch"
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
