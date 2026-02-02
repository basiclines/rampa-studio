import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface TerminalProps {
  children: React.ReactNode;
}

export const Terminal: React.FC<TerminalProps> = ({ children }) => {
  const frame = useCurrentFrame();

  // Subtle floating animation
  const rotateX = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [-2, 2]
  );
  const rotateY = interpolate(
    Math.cos(frame * 0.015),
    [-1, 1],
    [-3, 3]
  );
  const translateY = interpolate(
    Math.sin(frame * 0.025),
    [-1, 1],
    [-5, 5]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1200,
      }}
    >
      <div
        style={{
          width: "90%",
          height: "85%",
          backgroundColor: "#0d1117",
          borderRadius: 16,
          padding: 50,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 28,
          lineHeight: 1.6,
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Terminal window chrome */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 30,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#ff5f56",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#ffbd2e",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#27c93f",
            }}
          />
        </div>

        {/* Terminal content */}
        <div
          style={{
            flex: 1,
            color: "#e6edf3",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
