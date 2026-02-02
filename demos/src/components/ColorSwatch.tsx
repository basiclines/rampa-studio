import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface ColorSwatchProps {
  color: string;
  startFrame: number;
  index: number;
  compact?: boolean;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  startFrame,
  index,
  compact = false,
}) => {
  const frame = useCurrentFrame();

  const delay = index * 1; // Fast stagger - 1 frame per color
  const animationStart = startFrame + delay;

  const opacity = interpolate(frame, [animationStart, animationStart + 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(
    frame,
    [animationStart, animationStart + 4],
    [-10, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  if (frame < animationStart) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 16,
        opacity,
        transform: `translateX(${translateX}px)`,
        marginBottom: compact ? 2 : 4,
      }}
    >
      {/* Color square */}
      <div
        style={{
          width: compact ? 18 : 24,
          height: compact ? 18 : 24,
          backgroundColor: color,
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      {/* Hex value */}
      <span style={{ color: "#8b949e", fontSize: compact ? 16 : 24 }}>{color}</span>
    </div>
  );
};

interface ColorOutputProps {
  colors: string[];
  startFrame: number;
}

export const ColorOutput: React.FC<ColorOutputProps> = ({
  colors,
  startFrame,
}) => {
  // Use columns if more than 10 colors
  const useColumns = colors.length > 10;
  const columnSize = 10;
  
  if (useColumns) {
    // Split into columns of 10
    const columns: string[][] = [];
    for (let i = 0; i < colors.length; i += columnSize) {
      columns.push(colors.slice(i, i + columnSize));
    }
    
    return (
      <div style={{ 
        marginTop: 16, 
        marginLeft: 24,
        display: "flex",
        gap: 40,
      }}>
        {columns.map((column, colIndex) => (
          <div key={colIndex}>
            {column.map((color, index) => (
              <ColorSwatch
                key={`${color}-${colIndex}-${index}`}
                color={color}
                startFrame={startFrame}
                index={colIndex * columnSize + index}
                compact={true}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16, marginLeft: 24 }}>
      {colors.map((color, index) => (
        <ColorSwatch
          key={`${color}-${index}`}
          color={color}
          startFrame={startFrame}
          index={index}
        />
      ))}
    </div>
  );
};
