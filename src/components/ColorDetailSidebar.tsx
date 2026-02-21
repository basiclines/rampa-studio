import React from 'react';
import { CopyIcon } from '@radix-ui/react-icons';
import chroma from 'chroma-js';
import { convertToOklch, formatOklchString } from '@/engine/OklchEngine';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface ColorDetailSidebarProps {
  color: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ColorFormat {
  label: string;
  value: string;
}

function getColorFormats(color: string): ColorFormat[] {
  try {
    const c = chroma(color);
    const [r, g, b] = c.rgb();
    const [h, s, l] = c.hsl();
    const hex = c.hex();
    const oklch = convertToOklch(hex);
    const oklchStr = formatOklchString(oklch);

    const fmtH = isNaN(h) ? 0 : Math.round(h);
    const fmtS = Math.round(s * 100);
    const fmtL = Math.round(l * 100);

    return [
      { label: 'HEX', value: hex },
      { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
      { label: 'HSL', value: `hsl(${fmtH}, ${fmtS}%, ${fmtL}%)` },
      { label: 'OKLCH', value: oklchStr },
    ];
  } catch {
    return [{ label: 'HEX', value: color }];
  }
}

const ColorDetailSidebar: React.FC<ColorDetailSidebarProps> = ({ color, open, onOpenChange }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const formats = React.useMemo(() => getColorFormats(color), [color]);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiedIndex(null), 1000);
    } catch {
      // Clipboard not available
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Color Detail</SheetTitle>
          <SheetDescription className="sr-only">Color format conversions</SheetDescription>
        </SheetHeader>

        <div className="pt-4">
          {/* Color preview */}
          <div className="flex justify-center mb-6">
            <div
              className="rounded-full border-2 border-background shadow-lg"
              style={{
                width: 120,
                height: 120,
                backgroundColor: color,
              }}
            />
          </div>

          {/* Color formats */}
          <div className="space-y-3">
            {formats.map((fmt, i) => (
              <div key={fmt.label} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                    {fmt.label}
                  </div>
                  <div className="text-sm font-mono text-foreground truncate">
                    {fmt.value}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(fmt.value, i)}
                  className="flex-shrink-0 p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground"
                  title={`Copy ${fmt.label}`}
                >
                  {copiedIndex === i ? (
                    <span className="text-xs text-green-600 font-medium">✓</span>
                  ) : (
                    <CopyIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ColorDetailSidebar;
