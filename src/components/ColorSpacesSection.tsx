import React, { useState } from 'react';
import { Settings2, Share, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useColorSpaceStore } from '@/state/ColorSpaceState';
import ColorSpaceViewer3D from './ColorSpaceViewer3D';
import ColorSpaceControls from './ColorSpaceControls';
import ColorDetailSidebar from './ColorDetailSidebar';
import { ExportModal } from './ExportModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ColorSpacesSection: React.FC = () => {
  const { spaceType, linearConfig, cubeConfig } = useColorSpaceStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex relative" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Export & About - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={() => setShowExport(true)} variant="outline" className="gap-2">
          <Share className="w-4 h-4" />
          Export
        </Button>
        <Button onClick={() => setShowAbout(true)} variant="outline" className="gap-2">
          <Info className="w-4 h-4" />
          About
        </Button>
      </div>

      {/* Export Modal */}
      <ExportModal
        mode="space"
        spaceData={{ spaceType, linearConfig, cubeConfig }}
        open={showExport}
        onOpenChange={setShowExport}
      />

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
