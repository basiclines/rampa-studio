import React from 'react';
import { Cross1Icon, CopyIcon } from '@radix-ui/react-icons';
import chroma from 'chroma-js';
import { convertToOklch, formatOklchString } from '@/engine/OklchEngine';

interface ColorDetailSidebarProps {
  color: string;
  onClose: () => void;
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

const ColorDetailSidebar: React.FC<ColorDetailSidebarProps> = ({ color, onClose }) => {
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

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed top-0 right-0 z-40 r-material-light"
      style={{
        width: 300,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center p-6 pb-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Color Detail</span>
        <button className="r-close-button" onClick={onClose}>
          <Cross1Icon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Color preview */}
        <div className="flex justify-center mb-6">
          <div
            className="rounded-full border-2 border-white"
            style={{
              width: 120,
              height: 120,
              backgroundColor: color,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
        </div>

        {/* Color formats */}
        <div className="space-y-3">
          {formats.map((fmt, i) => (
            <div key={fmt.label} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  {fmt.label}
                </div>
                <div className="text-sm font-mono text-gray-800 truncate">
                  {fmt.value}
                </div>
              </div>
              <button
                onClick={() => handleCopy(fmt.value, i)}
                className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
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
    </div>
  );
};

export default ColorDetailSidebar;
