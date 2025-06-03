import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorRamp from '@/components/ColorRamp';
import ColorRampControls from '@/components/ColorRampControls';
import { useToast } from '@/hooks/use-toast';

import { useSelectColorRamp } from '@/usecases/SelectColorRamp';
import { useColorRampsStore } from '@/usecases/ColorRampsStore';
import { useDuplicateColorRamp } from '@/usecases/DuplicateColorRamp';
import { useRemoveColorRamp } from '@/usecases/RemoveColorRamp';
import { useUpdateColorRamp } from '@/usecases/UpdateColorRamp';
import { useExportColorRampsToSvg } from '@/usecases/ExportColorRampsToSvg';
import { usePreviewBlendModes } from '@/usecases/PreviewBlendModes';
import { usePreviewScaleTypes } from '@/usecases/PreviewScaleTypes';

const Index = () => {
  const { toast } = useToast();
  const rampRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});

  // State from usecases
  const colorRamps = useColorRampsStore(state => state.colorRamps);
  const { selectedRampId, selectColorRamp } = useSelectColorRamp();
  const { previewBlendModes, setPreviewBlendMode } = usePreviewBlendModes();
  const { previewScaleType, setPreviewScaleType } = usePreviewScaleTypes();

  // Actions from usecases
  const duplicateColorRamp = useDuplicateColorRamp();
  const removeColorRamp = useRemoveColorRamp();
  const updateColorRamp = useUpdateColorRamp();
  const exportToSvg = useExportColorRampsToSvg();

  const selectedRamp = colorRamps.find(ramp => ramp.id === selectedRampId);

  const handleExportSvg = () => {
    try {
      exportToSvg();
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
  };

  const handlePreviewBlendMode = (rampId: string, blendMode: string | undefined) => {
    setPreviewBlendMode(rampId, blendMode);
  };

  const handleColorRampClick = (rampId: string) => {
    selectColorRamp(rampId);
  };

  const closeSidebar = () => {
    selectColorRamp(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Export Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleExportSvg} variant="outline" className="gap-2 bg-white shadow-md">
          <Download className="w-4 h-4" />
          Export to Figma
        </Button>
      </div>

      {/* Fixed Sidebar - Only shown when a ramp is selected */}
      {selectedRamp && (
        <ColorRampControls
          ramp={selectedRamp}
          canDelete={colorRamps.length > 1}
          onUpdate={(updates) => updateColorRamp(selectedRamp.id, updates)}
          onDuplicate={() => duplicateColorRamp(selectedRamp)}
          onDelete={() => removeColorRamp(selectedRamp.id)}
          onPreviewBlendMode={(blendMode) => handlePreviewBlendMode(selectedRamp.id, blendMode)}
          closeSidebar={closeSidebar}
          previewScaleType={previewScaleType}
          setPreviewScaleType={setPreviewScaleType}
        />
      )}

      {/* Main Content */}
      <div
        className="flex-1 p-8"
        style={{
          paddingLeft: 48,
          paddingRight: 48,
          transition: 'padding-left 0.2s',
        }}
      >
        <div className="max-w-none">
          <div className="flex gap-6 pb-4 overflow-x-auto flex-nowrap justify-center mx-auto" style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
            {colorRamps.map((ramp) => {
              const isSelected = selectedRampId === ramp.id;
              const config = (isSelected && previewScaleType)
                ? {
                    ...ramp,
                    lightnessScaleType: previewScaleType,
                    hueScaleType: previewScaleType,
                    saturationScaleType: previewScaleType,
                  }
                : ramp;
              return (
                <div
                  key={ramp.id}
                  ref={el => (rampRefs.current[ramp.id] = el)}
                  onClick={() => handleColorRampClick(ramp.id)}
                  className="flex-shrink-0" style={{ width: 240, minWidth: 200, maxWidth: 320 }}
                >
                  <ColorRamp 
                    config={config} 
                    onUpdateConfig={(updates) => updateColorRamp(ramp.id, updates)}
                    onDuplicate={() => duplicateColorRamp(ramp)}
                    onDelete={colorRamps.length > 1 ? () => removeColorRamp(ramp.id) : undefined}
                    previewBlendMode={previewBlendModes[ramp.id]}
                    isSelected={isSelected}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
