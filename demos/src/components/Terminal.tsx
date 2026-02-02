import React from "react";

interface TerminalProps {
  children: React.ReactNode;
}

export const Terminal: React.FC<TerminalProps> = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        padding: 60,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 28,
        lineHeight: 1.6,
      }}
    >
      {/* Terminal window chrome */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 30,
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
  );
};
