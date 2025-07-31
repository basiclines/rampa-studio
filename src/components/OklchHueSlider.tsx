import React, { useRef, useEffect, useState, useCallback } from 'react';
import { convertFromOklch, isInSrgbGamut } from '@/engine/OklchEngine';

interface OklchHueSliderProps {
  hue: number;          // 0-360
  lightness: number;    // 0-1
  chroma: number;       // 0-0.4+
  width: number;
  onChange: (hue: number, complete?: boolean) => void;
}

const OklchHueSlider: React.FC<OklchHueSliderProps> = ({
  hue,
  lightness,
  chroma,
  width,
  onChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const height = 10; // Fixed height for hue slider

  // Render the hue gradient with gamut-aware fading
  const renderHueGradient = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
      // Map pixel to hue (0-360)
      const currentHue = (x / width) * 360;
      
      // Check if this L,C,H combination is achievable in sRGB
      const testColor = { l: lightness, c: chroma, h: currentHue };
      const isAchievable = isInSrgbGamut(testColor);
      
      // Get color at current lightness and chroma for this hue
      const hexColor = convertFromOklch(testColor);
      
      // Parse hex to RGB
      let r = parseInt(hexColor.slice(1, 3), 16);
      let g = parseInt(hexColor.slice(3, 5), 16);
      let b = parseInt(hexColor.slice(5, 7), 16);
      
      // If not achievable, fade it out by desaturating and reducing opacity
      if (!isAchievable) {
        // Convert to grayscale and reduce opacity
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        r = Math.round(r * 0.3 + gray * 0.7); // Mix with gray
        g = Math.round(g * 0.3 + gray * 0.7);
        b = Math.round(b * 0.3 + gray * 0.7);
      }

      // Fill entire column with this color
      for (let y = 0; y < height; y++) {
        const pixelIndex = (y * width + x) * 4;
        data[pixelIndex] = r;     // Red
        data[pixelIndex + 1] = g; // Green
        data[pixelIndex + 2] = b; // Blue
        data[pixelIndex + 3] = isAchievable ? 255 : 120; // Reduce alpha for unachievable colors
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw indicator for current hue
    const currentX = Math.round((hue / 360) * width);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ffffff';
    
    // Draw white circle with black border
    ctx.beginPath();
    ctx.arc(currentX, height / 2, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw small inner circle
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(currentX, height / 2, 2, 0, 2 * Math.PI);
    ctx.fill();
  }, [hue, lightness, chroma, width, height]);

  // Re-render when values change
  useEffect(() => {
    renderHueGradient();
  }, [renderHueGradient]);

  const handleMouseEvent = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(width, event.clientX - rect.left));

    // Convert pixel to hue (0-360)
    const newHue = (x / width) * 360;
    
    // Check if this hue is achievable with current lightness and chroma
    const testColor = { l: lightness, c: chroma, h: newHue };
    const isAchievable = isInSrgbGamut(testColor);
    
    // Only allow selection of achievable hues
    if (isAchievable) {
      onChange(newHue, event.type === 'mouseup');
    }
  }, [width, lightness, chroma, onChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleMouseEvent(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Update cursor based on whether this position is selectable
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(width, event.clientX - rect.left));
      const newHue = (x / width) * 360;
      const testColor = { l: lightness, c: chroma, h: newHue };
      const isAchievable = isInSrgbGamut(testColor);
      
      canvas.style.cursor = isAchievable ? 'pointer' : 'not-allowed';
    }

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
    // Reset cursor when leaving
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'pointer';
    }
  };

  return (
    <div className="oklch-hue-slider">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className=""
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', cursor: 'pointer' }}
      />
    </div>
  );
};

export default OklchHueSlider;