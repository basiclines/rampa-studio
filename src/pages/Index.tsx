import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ColorRamp from '@/components/ColorRamp';
import ColorRampControls from '@/components/ColorRampControls';
import { generateColorRamp, exportToSvg } from '@/lib/colorUtils';
import { useToast } from '@/hooks/use-toast';
import { ColorRampConfig } from '@/types/colorRamp';
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

const Index = () => {
  const { toast } = useToast();
  const [previewBlendModes, setPreviewBlendModes] = useState<{ [rampId: string]: string | undefined }>({});
  const [selectedRampId, setSelectedRampId] = useState<string | null>(null);
  const [colorRamps, setColorRamps] = useState<ColorRampConfig[]>([
    {
      id: '1',
      name: 'Primary',
      baseColor: '#3b82f6',
      totalSteps: 10,
      lightnessRange: 80,
      lightnessAdvanced: false,
      chromaRange: 0,
      chromaAdvanced: false,
      saturationRange: 40,
      saturationAdvanced: false,
      lockedColors: {},
    },
  ]);
  const rampRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const [sidebarPos, setSidebarPos] = useState<{ top: number; left: number; side: 'left' | 'right' } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const selectedRamp = colorRamps.find(ramp => ramp.id === selectedRampId);

  const addColorRamp = useCallback(() => {
    const newRamp: ColorRampConfig = {
      id: Date.now().toString(),
      name: `Ramp ${colorRamps.length + 1}`,
      baseColor: '#6366f1',
      totalSteps: 10,
      lightnessRange: 80,
      chromaRange: 60,
      saturationRange: 40,
      lockedColors: {},
    };
    setColorRamps(prev => [...prev, newRamp]);
  }, [colorRamps.length]);

  const duplicateColorRamp = useCallback((ramp: ColorRampConfig) => {
    const duplicatedRamp: ColorRampConfig = {
      ...ramp,
      id: Date.now().toString(),
      name: `${ramp.name} Copy`,
    };
    setColorRamps(prev => [...prev, duplicatedRamp]);
  }, []);

  const removeColorRamp = useCallback((id: string) => {
    setColorRamps(prev => prev.filter(ramp => ramp.id !== id));
    if (selectedRampId === id) {
      setSelectedRampId(null);
    }
  }, [selectedRampId]);

  const updateColorRamp = useCallback((id: string, updates: Partial<ColorRampConfig>) => {
    setColorRamps(prev => prev.map(ramp => 
      ramp.id === id ? { ...ramp, ...updates } : ramp
    ));
  }, []);

  const handleExportSvg = useCallback(() => {
    try {
      const allColors = colorRamps.map(ramp => ({
        name: ramp.name,
        colors: generateColorRamp(ramp),
      }));
      
      const svgContent = exportToSvg(allColors);
      navigator.clipboard.writeText(svgContent);
      
      toast({
        title: "Color ramps in the clipboard",
        description: "Now just paste them in Figma",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "There was an error copying your palette.",
        variant: "destructive",
      });
    }
  }, [colorRamps, toast]);

  const handlePreviewBlendMode = useCallback((rampId: string, blendMode: string | undefined) => {
    setPreviewBlendModes(prev => ({
      ...prev,
      [rampId]: blendMode
    }));
  }, []);

  const handleColorRampClick = useCallback((rampId: string) => {
    setSelectedRampId(rampId);
  }, []);

  const closeSidebar = useCallback(() => {
    setSelectedRampId(null);
  }, []);

  // Check if any ramp has advanced mode enabled
  const hasAdvancedMode = selectedRamp && (
    selectedRamp.lightnessAdvanced || selectedRamp.chromaAdvanced || selectedRamp.saturationAdvanced
  );

  useEffect(() => {
    if (!selectedRampId) {
      setSidebarPos(null);
      return;
    }
    const rampNode = rampRefs.current[selectedRampId];
    if (!rampNode) return;
    const rect = rampNode.getBoundingClientRect();
    const sidebarWidth = hasAdvancedMode ? 600 : 320;
    const gap = 24;
    const windowWidth = window.innerWidth;
    // Prefer left if both sides have space
    const hasSpaceRight = rect.right + sidebarWidth + gap <= windowWidth;
    const hasSpaceLeft = rect.left - sidebarWidth - gap >= 0;
    let left = rect.right + gap;
    let side: 'left' | 'right' = 'right';
    if (hasSpaceLeft && hasSpaceRight) {
      left = rect.left - sidebarWidth - gap;
      side = 'left';
    } else if (hasSpaceLeft) {
      left = rect.left - sidebarWidth - gap;
      side = 'left';
    } else if (hasSpaceRight) {
      left = rect.right + gap;
      side = 'right';
    }
    setSidebarPos({
      top: rect.top + window.scrollY,
      left: left + window.scrollX,
      side,
    });
  }, [selectedRampId, hasAdvancedMode]);

  useEffect(() => {
    const handleResize = () => {
      if (selectedRampId) {
        const rampNode = rampRefs.current[selectedRampId];
        if (!rampNode) return;
        const rect = rampNode.getBoundingClientRect();
        const sidebarWidth = hasAdvancedMode ? 600 : 320;
        const gap = 24;
        const windowWidth = window.innerWidth;
        // Prefer left if both sides have space
        const hasSpaceRight = rect.right + sidebarWidth + gap <= windowWidth;
        const hasSpaceLeft = rect.left - sidebarWidth - gap >= 0;
        let left = rect.right + gap;
        let side: 'left' | 'right' = 'right';
        if (hasSpaceLeft && hasSpaceRight) {
          left = rect.left - sidebarWidth - gap;
          side = 'left';
        } else if (hasSpaceLeft) {
          left = rect.left - sidebarWidth - gap;
          side = 'left';
        } else if (hasSpaceRight) {
          left = rect.right + gap;
          side = 'right';
        }
        setSidebarPos({
          top: rect.top + window.scrollY,
          left: left + window.scrollX,
          side,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [selectedRampId, hasAdvancedMode]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Export Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleExportSvg} variant="outline" className="gap-2 bg-white shadow-md">
          <Download className="w-4 h-4" />
          Export to Figma
        </Button>
      </div>

      {/* Floating Sidebar - Only shown when a ramp is selected */}
      {selectedRamp && sidebarPos && (
        <div
          style={{
            position: 'absolute',
            top: sidebarPos.top,
            left: sidebarPos.left,
            width: hasAdvancedMode ? 600 : 320,
            zIndex: 40,
            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
            borderRadius: 16,
            background: 'white',
            border: '1px solid #e5e7eb',
            transition: 'left 0.2s, top 0.2s',
          }}
        >
          <ScrollArea className="h-screen">
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" size="sm" onClick={closeSidebar}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ColorRampControls
                ramp={selectedRamp}
                canDelete={colorRamps.length > 1}
                onUpdate={(updates) => updateColorRamp(selectedRamp.id, updates)}
                onDuplicate={() => duplicateColorRamp(selectedRamp)}
                onDelete={() => removeColorRamp(selectedRamp.id)}
                onPreviewBlendMode={(blendMode) => handlePreviewBlendMode(selectedRamp.id, blendMode)}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-8" style={{ paddingLeft: 48, paddingRight: 48 }}>
        <div className="max-w-none">
          <div className="flex gap-6 pb-4 overflow-x-auto flex-nowrap justify-center mx-auto" style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
            {colorRamps.map((ramp) => (
              <div
                key={ramp.id}
                ref={el => (rampRefs.current[ramp.id] = el)}
                onClick={() => handleColorRampClick(ramp.id)}
                className="flex-shrink-0" style={{ width: 240, minWidth: 200, maxWidth: 320 }}
              >
                <ColorRamp 
                  config={ramp} 
                  onUpdateConfig={(updates) => updateColorRamp(ramp.id, updates)}
                  onDuplicate={() => duplicateColorRamp(ramp)}
                  onDelete={colorRamps.length > 1 ? () => removeColorRamp(ramp.id) : undefined}
                  previewBlendMode={previewBlendModes[ramp.id]}
                  isSelected={selectedRampId === ramp.id}
                  colorRamps={colorRamps}
                  setColorRamps={setColorRamps}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
