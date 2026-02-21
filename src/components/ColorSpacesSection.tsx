import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useColorSpaceStore } from '@/state/ColorSpaceState';
import ColorSpaceViewer3D from './ColorSpaceViewer3D';
import ColorSpaceControls from './ColorSpaceControls';
import ColorDetailSidebar from './ColorDetailSidebar';

const ColorSpacesSection: React.FC = () => {
  const { spaceType, linearConfig, cubeConfig } = useColorSpaceStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  return (
    <div className="flex relative r-canvas-dotgrid" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Settings Sheet */}
      <ColorSpaceControls open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Open sidebar button — shown when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed top-20 left-4 z-50">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Settings
          </Button>
        </div>
      )}

      {/* Full-viewport 3D canvas */}
      <div className="flex-1" style={{ position: 'absolute', inset: 0 }}>
        {spaceType === 'linear' ? (
          <ColorSpaceViewer3D
            type="linear"
            fromColor={linearConfig.fromColor}
            toColor={linearConfig.toColor}
            steps={linearConfig.steps}
            interpolation={linearConfig.interpolation}
            onColorSelect={setSelectedColor}
            selectedColor={selectedColor}
          />
        ) : (
          <ColorSpaceViewer3D
            type="cube"
            corners={cubeConfig.corners}
            stepsPerAxis={cubeConfig.stepsPerAxis}
            interpolation={cubeConfig.interpolation}
            onColorSelect={setSelectedColor}
            selectedColor={selectedColor}
          />
        )}
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

export default ColorSpacesSection;
