import React, { useRef, useEffect, useState, useCallback } from 'react';
import { convertFromOklch, getMaxChromaForLH, isInSrgbGamut } from '@/engine/OklchEngine';

interface OklchFieldProps {
  lightness: number;    // 0-1
  chroma: number;       // 0-0.4+
  hue: number;          // 0-360
  width: number;
  height: number;
  onChange: (lightness: number, chroma: number, complete?: boolean) => void;
}

const OklchField: React.FC<OklchFieldProps> = ({
  lightness,
  chroma,
  hue,
  width,
  height,
  onChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Render the LC color field
  const renderField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Map pixel coordinates to L,C values
        const l = 1 - (y / height); // Y axis: 1 (white) at top, 0 (black) at bottom
        const maxChroma = getMaxChromaForLH(l, hue);
        const c = (x / width) * maxChroma; // X axis: 0 (gray) at left, max chroma at right

        // Check if this L,C,H combination is achievable
        const testColor = { l, c, h: hue };
        const isAchievable = isInSrgbGamut(testColor);

        // Get RGB color for this L,C,H combination
        const hexColor = convertFromOklch(testColor);
        
        // Parse hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        // If not achievable, fade it out
        if (!isAchievable) {
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          r = Math.round(r * 0.4 + gray * 0.6); // Mix with gray
          g = Math.round(g * 0.4 + gray * 0.6);
          b = Math.round(b * 0.4 + gray * 0.6);
        }

        const pixelIndex = (y * width + x) * 4;
        data[pixelIndex] = r;     // Red
        data[pixelIndex + 1] = g; // Green
        data[pixelIndex + 2] = b; // Blue
        data[pixelIndex + 3] = isAchievable ? 255 : 100; // Reduce alpha for unachievable areas
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw crosshair for current position
    const currentX = Math.round((chroma / Math.max(getMaxChromaForLH(lightness, hue), 0.001)) * width);
    const currentY = Math.round((1 - lightness) * height);

    ctx.strokeStyle = lightness > 0.5 ? '#000000' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Horizontal line
    ctx.moveTo(currentX - 10, currentY);
    ctx.lineTo(currentX + 10, currentY);
    
    // Vertical line
    ctx.moveTo(currentX, currentY - 10);
    ctx.lineTo(currentX, currentY + 10);
    
    ctx.stroke();

    // Draw circle around crosshair
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    ctx.stroke();
  }, [lightness, chroma, hue, width, height]);

  // Re-render when values change
  useEffect(() => {
    renderField();
  }, [renderField]);

  const handleMouseEvent = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to L,C values
    const newLightness = Math.max(0, Math.min(1, 1 - (y / height)));
    const maxChroma = getMaxChromaForLH(newLightness, hue);
    const newChroma = Math.max(0, Math.min(maxChroma, (x / width) * maxChroma));

    onChange(newLightness, newChroma, event.type === 'mouseup');
  }, [hue, width, height, onChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleMouseEvent(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleMouseEvent(event);
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      handleMouseEvent(event);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="oklch-field">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair border border-gray-300 rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      />
      <div className="text-xs text-gray-500 mt-1 text-center">
        Lightness ↑ · Chroma →
      </div>
    </div>
  );
};

export default OklchField;