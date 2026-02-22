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
} from '@/usecases/GenerateExports';

interface ExportModalProps {
  ramps: ColorRampConfig[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = [
  { id: 'text', label: 'Text', ext: '.txt', mime: 'text/plain' },
  { id: 'svg', label: 'SVG', ext: '.svg', mime: 'image/svg+xml' },
  { id: 'css', label: 'CSS', ext: '.css', mime: 'text/css' },
  { id: 'json', label: 'JSON', ext: '.json', mime: 'application/json' },
  { id: 'sdk', label: 'SDK', ext: '.ts', mime: 'text/typescript' },
  { id: 'cli', label: 'CLI', ext: '.sh', mime: 'text/x-shellscript' },
] as const;

type TabId = typeof TABS[number]['id'];

const generators: Record<TabId, (ramps: ColorRampConfig[]) => string> = {
  text: generateTextExport,
  svg: generateSvgExport,
  css: generateCssExport,
  json: generateJsonExport,
  sdk: generateSdkExport,
  cli: generateCliExport,
};

export const ExportModal: React.FC<ExportModalProps> = ({ ramps, open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState<TabId>('text');
  const [copied, setCopied] = useState(false);

  const outputs = useMemo(() => {
    if (!open) return {} as Record<TabId, string>;
    return Object.fromEntries(
      TABS.map(tab => [tab.id, generators[tab.id](ramps)])
    ) as Record<TabId, string>;
  }, [ramps, open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputs[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const tab = TABS.find(t => t.id === activeTab)!;
    const blob = new Blob([outputs[activeTab]], { type: tab.mime });
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
          <DialogDescription className="sr-only">Export your color ramps in various formats</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabId); setCopied(false); }} className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6">
            {TABS.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(tab => (
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
