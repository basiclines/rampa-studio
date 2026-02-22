import React, { useRef } from 'react';
import { Copy, Info, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorRamp from '@/components/ColorRamp';
import ColorRampControls from '@/components/ColorRampControls';
import ColorDetailSidebar from '@/components/ColorDetailSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CopyButton } from '@/components/ui/CopyButton';

import { useSelectColorRamp } from '@/usecases/SelectColorRamp';
import { useSaveColorRamp } from '@/state/SaveColorRampState';
import { useDuplicateColorRamp } from '@/usecases/DuplicateColorRamp';
import { useRemoveColorRamp } from '@/usecases/RemoveColorRamp';
import { useUpdateColorRamp } from '@/usecases/UpdateColorRamp';
import { useExportColorRampsToSvg } from '@/usecases/ExportColorRampsToSvg';
import { useExportColorRampsToJson } from '@/usecases/ExportColorRampsToJson';
import { usePreviewBlendModes } from '@/usecases/PreviewBlendModes';
import { usePreviewScaleTypes } from '@/usecases/PreviewScaleTypes';

const ColorsSection: React.FC = () => {
  const rampRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const [showAbout, setShowAbout] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);

  // State from usecases
  const colorRamps = useSaveColorRamp(state => state.colorRamps);
  const { selectedRampId, selectColorRamp } = useSelectColorRamp();
  const { previewBlendModes, setPreviewBlendMode } = usePreviewBlendModes();
  const { previewScaleType, setPreviewScaleType } = usePreviewScaleTypes();

  // Actions from usecases
  const duplicateColorRamp = useDuplicateColorRamp();
  const removeColorRamp = useRemoveColorRamp();
  const updateColorRamp = useUpdateColorRamp();
  const exportToSvg = useExportColorRampsToSvg();
  const exportToJson = useExportColorRampsToJson();

  const selectedRamp = colorRamps.find(ramp => ramp.id === selectedRampId);

  const handleExportSvg = () => {
    try {
      exportToSvg();
    } catch (error) {
      // Handle error
    }
  };

  const handleExportJson = () => {
    try {
      exportToJson();
    } catch (error) {
      // Handle error
    }
  };

  const handlePreviewBlendMode = (rampId: string, blendMode: string | undefined) => {
    setPreviewBlendMode(rampId, blendMode);
  };

  const handleColorRampClick = (rampId: string) => {
    if (selectedRampId !== rampId) {
      setSelectedColor(null);
    }
    selectColorRamp(rampId);
  };

  const closeSidebar = () => {
    selectColorRamp(null);
  };

  return (
    <div className="flex relative h-full">
      {/* Export Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <CopyButton
          onCopy={handleExportSvg}
          variant="outline"
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy SVG
        </CopyButton>
        <CopyButton
          onCopy={handleExportJson}
          variant="outline"
          className="gap-2"
        >
          <FileJson className="w-4 h-4" />
          Copy JSON
        </CopyButton>
        <Button onClick={() => setShowAbout(true)} variant="outline" className="gap-2">
          <Info className="w-4 h-4" />
          About
        </Button>
      </div>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Rampa</DialogTitle>
            <DialogDescription>
              Rampa is built by <a href="https://ismael.fyi" target="_blank" rel="noopener noreferrer" className="text-blue-500">ismael.fyi</a>
              <br />
              Any feedback is welcome, just reach out at ismael@secture.com
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Ramp Settings Sheet */}
      <ColorRampControls
        ramp={selectedRamp || colorRamps[0]}
        canDelete={colorRamps.length > 1}
        open={!!selectedRamp}
        onOpenChange={(open) => { if (!open) closeSidebar(); }}
        onUpdate={(updates) => selectedRamp && updateColorRamp(selectedRamp.id, updates)}
        onDelete={() => selectedRamp && removeColorRamp(selectedRamp.id)}
        onPreviewBlendMode={(blendMode) => selectedRamp && handlePreviewBlendMode(selectedRamp.id, blendMode)}
        previewScaleType={previewScaleType}
        setPreviewScaleType={setPreviewScaleType}
      />

      {/* Main Content */}
      <div className="flex-1 px-12 py-4 h-full">
        <div className="max-w-none h-full">
          <div className="flex gap-6 overflow-x-auto flex-nowrap justify-center mx-auto h-full" style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
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
                    previewBlendMode={previewBlendModes[ramp.id]}
                    isSelected={isSelected}
                    onColorClick={(color) => setSelectedColor(color)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Detail Sheet */}
      <ColorDetailSidebar
        color={selectedColor || ''}
        open={!!selectedColor}
        onOpenChange={(open) => { if (!open) setSelectedColor(null); }}
      />
    </div>
  );
};

export default ColorsSection;