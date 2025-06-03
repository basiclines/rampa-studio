import React, { useMemo, useState } from 'react';
import { Lock, Clipboard, Copy, Trash2, Plus } from 'lucide-react';
import { generateColorRamp } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { ColorRampConfig } from '@/entities/ColorRamp';
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
import chroma from 'chroma-js';
import { useEditColorRampName } from '@/usecases/EditColorRampName';
import { useLockRampColor } from '@/usecases/LockRampColor';
import { useLockAllRampColors } from '@/usecases/LockAllRampColors';
import { useCopyAllColors } from '@/usecases/CopyAllColors';
import { useDuplicateColorRamp } from '@/usecases/DuplicateColorRamp';
import { useCreateHarmonyRamps } from '@/usecases/CreateHarmonyRamps';

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
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Usecases
  const editColorRampName = useEditColorRampName();
  const lockRampColor = useLockRampColor();
  const lockAllRampColors = useLockAllRampColors();
  const copyAllColors = useCopyAllColors();
  const duplicateColorRamp = useDuplicateColorRamp();
  const createHarmonyRamps = useCreateHarmonyRamps();
  
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

  const handleCopyAllColors = () => {
    const copiedColors = copyAllColors(config);
  };

  const toggleLockColor = (index: number, color: string) => {
    lockRampColor(config.id, index, color);
    const isLocked = config.swatches && config.swatches[index]?.locked;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  // Add a function to lock/unlock all colors
  const allLocked = config.swatches.length > 0 && config.swatches.every(swatch => swatch.locked);
  const handleLockAll = () => {
    lockAllRampColors(config.id, colors, !allLocked);
  };

  const handleHarmonyRamp = (harmonyType: 'analogous' | 'triad' | 'complementary' | 'split-complementary' | 'square' | 'compound') => {
    createHarmonyRamps(config, harmonyType);
  };

  const handleFallbackDuplicate = () => {
    duplicateColorRamp(config);
  };

  return (
    <div 
      className="space-y-4 flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg relative"
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
        {(isHovered || isSelected) && (
          <div className="absolute top-2 right-2 z-30 flex gap-1 pointer-events-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyAllColors}
              className="h-8 w-8 p-0 bg-white"
              style={{ pointerEvents: 'auto' }}
            >
              <Clipboard className="w-3 h-3" />
            </Button>
            {/* Lock/Unlock All Colors Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLockAll}
              className="h-8 w-8 p-0 bg-white"
              style={{ pointerEvents: 'auto' }}
              title={allLocked ? 'Unlock all colors' : 'Lock all colors'}
            >
              <Lock className="w-3 h-3" fill={allLocked ? 'currentColor' : 'none'} />
            </Button>
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
                    aria-label="Ramp actions"
                    onClick={e => e.stopPropagation()}
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                  <DropdownMenuItem
                    onSelect={e => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      if (onDuplicate) {
                        onDuplicate();
                      } else {
                        handleFallbackDuplicate();
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 220 }}>
                      <span>Duplicate</span>
                      <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: config.baseColor, border: '1.5px solid #e5e7eb' }} />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('analogous'); }}>
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
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('triad'); }}>
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
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('complementary'); }}>
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
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('split-complementary'); }}>
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
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('square'); }}>
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
                  <DropdownMenuItem onSelect={e => { e?.preventDefault(); e?.stopPropagation(); handleHarmonyRamp('compound'); }}>
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
          <div
            className="relative"
            onMouseEnter={() => setIsEditing(true)}
            onMouseLeave={() => setIsEditing(false)}
          >
            <Input
              value={config.name}
              onChange={e => editColorRampName(config.id, e.target.value)}
              className={`text-base font-medium text-center transition-all duration-150
                ${isEditing ? 'border border-gray-200 p-2 bg-white focus-visible:ring-2 focus-visible:ring-blue-500' : 'border-none bg-transparent p-0 focus-visible:ring-0 cursor-pointer'}`}
              placeholder="Color ramp name"
              spellCheck={false}
              tabIndex={0}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            />
          </div>
      </div>
      
      <div className="relative isolate" style={{ height: 'calc(100% - 56px)' }}>
        {/* Color Ramp */}
        <div className="flex flex-col gap-1" style={{ height: '100%' }}>
          {colors.map((color, index) => {
            const isLocked = config.swatches && config.swatches[index]?.locked;
            return (
              <div key={index} className="relative flex-1 min-h-0">
                <div
                  className="group relative w-full h-full overflow-hidden transition-all duration-200 flex items-stretch"
                  style={{ backgroundColor: color }}
                >
                  {/* Hex value on bottom-right - only visible when hovering the entire ramp */}
                  {(isHovered || isSelected) && (
                    <div className="absolute bottom-1 right-1 z-20">
                      <span className="text-xs text-white text-opacity-90 bg-black bg-opacity-50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        {config.colorFormat === 'hsl' 
                          ? chroma(color).hsl().map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100)).join(', ')
                          : color
                        }
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
