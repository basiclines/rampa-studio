import React from 'react';
import GradientControl from '@/components/GradientControl';
import { ColorRampConfig } from '@/entities/ColorRampEntity';
import { cn } from '@/engine/utils';
import chroma from 'chroma-js';
import { useSetTintOpacity } from '@/usecases/SetTintOpacity';

interface OpacitySliderProps {
  ramp: ColorRampConfig;
  onUpdate: (updates: Partial<ColorRampConfig>) => void;
  className?: string;
}

const OpacitySlider: React.FC<OpacitySliderProps> = ({ ramp, onUpdate, className }) => {
  const setTintOpacity = useSetTintOpacity();

  // Generate a simple opacity gradient from solid to transparent of the base color
  const gradientColors = React.useMemo(() => {
    try {
      const colors: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const a = 1 - i / 10; // 1 -> 0 top-to-bottom
        colors.push(chroma(ramp.baseColor).alpha(a).css());
      }
      return colors;
    } catch {
      // Fallback to black -> transparent
      const colors: string[] = [];
      for (let i = 0; i <= 10; i++) {
        const a = 1 - i / 10;
        colors.push(chroma('black').alpha(a).css());
      }
      return colors;
    }
  }, [ramp.baseColor]);

  const currentOpacity = typeof ramp.tintOpacity === 'number' ? ramp.tintOpacity : 0;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <GradientControl
        label="Opacity"
        startValue={100} // anchor at top
        endValue={currentOpacity}
        min={0}
        max={100}
        onValuesChange={(_, end) => setTintOpacity(ramp.id, Math.round(end))}
        formatValue={(v) => `${Math.round(v)}%`}
        gradientColors={gradientColors}
        referenceColor={ramp.baseColor}
        className="h-full flex-1"
        invertValues={true}
        totalSteps={ramp.totalSteps}
        scaleType={ramp.lightnessScaleType}
        swapHandlerColors={true}
      />
    </div>
  );
};

export default OpacitySlider;