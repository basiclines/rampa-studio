import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface ColorSwatchProps {
  color: string;
  startFrame: number;
  index: number;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  startFrame,
  index,
}) => {
  const frame = useCurrentFrame();

  const delay = index * 3; // Stagger each color
  const animationStart = startFrame + delay;

  const opacity = interpolate(frame, [animationStart, animationStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(
    frame,
    [animationStart, animationStart + 10],
    [-20, 0],
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
        gap: 16,
        opacity,
        transform: `translateX(${translateX}px)`,
        marginBottom: 4,
      }}
    >
      {/* Color square */}
      <div
        style={{
          width: 24,
          height: 24,
          backgroundColor: color,
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      {/* Hex value */}
      <span style={{ color: "#8b949e", fontSize: 24 }}>{color}</span>
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
