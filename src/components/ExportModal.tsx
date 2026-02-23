import React, { useMemo, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import {
  generateTextExport,
  generateSvgExport,
  generateCssExport,
  generateJsonExport,
  generateSdkExport,
  generateCliExport,
  generateSpaceTextExport,
  generateSpaceCssExport,
  generateSpaceJsonExport,
  generateSpaceSdkExport,
  generateSpaceCliExport,
  type ColorSpaceExportData,
} from '@/usecases/GenerateExports';

interface RampExportModalProps {
  mode: 'ramps';
  ramps: ColorRampConfig[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SpaceExportModalProps {
  mode: 'space';
  spaceData: ColorSpaceExportData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type ExportModalProps = RampExportModalProps | SpaceExportModalProps;

const RAMP_TABS = [
  { id: 'text', label: 'Text', ext: '.txt', mime: 'text/plain' },
  { id: 'svg', label: 'SVG', ext: '.svg', mime: 'image/svg+xml' },
  { id: 'css', label: 'CSS', ext: '.css', mime: 'text/css' },
  { id: 'json', label: 'JSON', ext: '.json', mime: 'application/json' },
  { id: 'sdk', label: 'SDK', ext: '.ts', mime: 'text/typescript' },
  { id: 'cli', label: 'CLI', ext: '.sh', mime: 'text/x-shellscript' },
] as const;

const SPACE_TABS = [
  { id: 'text', label: 'Text', ext: '.txt', mime: 'text/plain' },
  { id: 'css', label: 'CSS', ext: '.css', mime: 'text/css' },
  { id: 'json', label: 'JSON', ext: '.json', mime: 'application/json' },
  { id: 'sdk', label: 'SDK', ext: '.ts', mime: 'text/typescript' },
  { id: 'cli', label: 'CLI', ext: '.sh', mime: 'text/x-shellscript' },
] as const;

type TabDef = { id: string; label: string; ext: string; mime: string };

export const ExportModal: React.FC<ExportModalProps> = (props) => {
  const { open, onOpenChange } = props;
  const [activeTab, setActiveTab] = useState('text');
  const [copied, setCopied] = useState(false);

  const tabs: readonly TabDef[] = props.mode === 'ramps' ? RAMP_TABS : SPACE_TABS;

  const outputs = useMemo(() => {
    if (!open) return {} as Record<string, string>;

    if (props.mode === 'ramps') {
      const ramps = props.ramps;
      return {
        text: generateTextExport(ramps),
        svg: generateSvgExport(ramps),
        css: generateCssExport(ramps),
        json: generateJsonExport(ramps),
        sdk: generateSdkExport(ramps),
        cli: generateCliExport(ramps),
      };
    }

    const data = props.spaceData;
    return {
      text: generateSpaceTextExport(data),
      css: generateSpaceCssExport(data),
      json: generateSpaceJsonExport(data),
      sdk: generateSpaceSdkExport(data),
      cli: generateSpaceCliExport(data),
    };
  }, [props, open]);

  const validTab = tabs.find(t => t.id === activeTab) ? activeTab : 'text';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputs[validTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const tab = tabs.find(t => t.id === validTab)!;
    const blob = new Blob([outputs[validTab]], { type: tab.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rampa-export${tab.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Export</DialogTitle>
          <DialogDescription className="sr-only">Export your colors in various formats</DialogDescription>
        </DialogHeader>

        <Tabs value={validTab} onValueChange={(v) => { setActiveTab(v); setCopied(false); }} className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="flex-1 min-h-0 mt-0">
              <ScrollArea className="h-[50vh] px-6 py-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground">
                  {outputs[tab.id]}
                </pre>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
