import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Terminal } from "../components/Terminal";
import { ColorOutput } from "../components/ColorSwatch";

// REAL outputs from rampa CLI

// rampa -C "#3b82f6" --size=10
const COLORS_SIZE_10 = [
  "#000000", "#031d36", "#0d3665", "#1c4e8e", "#3265b0",
  "#5b80c0", "#8ea0c6", "#bac1d3", "#e0e1e6", "#ffffff",
];

// rampa -C "#3b82f6" --size=10 --add=complementary
const COLORS_COMPLEMENTARY = [
  "#000000", "#031d36", "#0d3665", "#1c4e8e", "#3265b0",
  "#5b80c0", "#8ea0c6", "#bac1d3", "#e0e1e6", "#ffffff",
  "#000000", "#361c03", "#653b0d", "#8e5c1c", "#b07e32",
  "#c09c5b", "#c6b48e", "#d3ccba", "#e6e4e0", "#ffffff",
];

// rampa -C "#3b82f6" --size=10 --add=triadic
const COLORS_TRIADIC = [
  "#000000", "#031d36", "#0d3665", "#1c4e8e", "#3265b0",
  "#5b80c0", "#8ea0c6", "#bac1d3", "#e0e1e6", "#ffffff",
  "#000000", "#36031d", "#650d36", "#8e1c4e", "#b03265",
  "#c05b80", "#c68ea0", "#d3bac1", "#e6e0e1", "#ffffff",
  "#000000", "#1d3603", "#36650d", "#4e8e1c", "#65b032",
  "#80c05b", "#a0c68e", "#c1d3ba", "#e1e6e0", "#ffffff",
];

// rampa -C "#3b82f6" --size=10 --add=shift:45
const COLORS_SHIFT = [
  "#000000", "#031d36", "#0d3665", "#1c4e8e", "#3265b0",
  "#5b80c0", "#8ea0c6", "#bac1d3", "#e0e1e6", "#ffffff",
  "#000000", "#0f0336", "#250d65", "#401c8e", "#5f32b0",
  "#825bc0", "#a68ec6", "#c5bad3", "#e3e0e6", "#ffffff",
];

// Token styling
const tokenStyles: Record<string, React.CSSProperties> = {
  command: { color: "#d2a8ff" },
  flag: { color: "#79c0ff" },
  value: { color: "#ffa657" },
  default: { color: "#e6edf3" },
};

// Render a command with syntax highlighting
const HighlightedCommand: React.FC<{ text: string }> = ({ text }) => {
  const parts: React.ReactNode[] = [];
  const regex = /(-[A-Za-z]|--[a-z-]+)(=?)("[^"]*"|[^\s]*)?|(\S+)/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    const [, flag, equals, value, other] = match;
    if (flag) {
      parts.push(<span key={key++} style={tokenStyles.flag}>{flag}</span>);
      if (equals) parts.push(<span key={key++} style={tokenStyles.default}>=</span>);
      if (value) parts.push(<span key={key++} style={tokenStyles.value}>{value}</span>);
    } else if (other === "rampa") {
      parts.push(<span key={key++} style={tokenStyles.command}>{other}</span>);
    } else if (other) {
      parts.push(<span key={key++} style={tokenStyles.value}>{other}</span>);
    }
    parts.push(<span key={key++}> </span>);
  }
  return <>{parts}</>;
};

// Command scenes timeline (removed L/S scenes)
const commandTimeline = [
  { 
    base: "", 
    addition: 'rampa -C "#3b82f6" --size=10',
    colors: COLORS_SIZE_10,
    additionStart: 10,
    colorStart: 80,
    end: 150,
  },
  { 
    base: '', 
    addition: 'rampa -C "#3b82f6" --size=10 --add=complementary',
    colors: COLORS_COMPLEMENTARY,
    additionStart: 160,
    colorStart: 260,
    end: 340,
  },
  { 
    base: 'rampa -C "#3b82f6" --size=10 --add=', 
    addition: 'triadic',
    colors: COLORS_TRIADIC,
    additionStart: 350,
    colorStart: 380,
    end: 480,
  },
  { 
    base: 'rampa -C "#3b82f6" --size=10 --add=', 
    addition: 'shift:45',
    colors: COLORS_SHIFT,
    additionStart: 490,
    colorStart: 520,
    end: 600,
  },
];

// Combined install scene - just commands, no titles
const InstallScene: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const brewOpacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const npmOpacity = interpolate(localFrame, [35, 50], [0, 1], { extrapolateRight: "clamp" });
  const skillsOpacity = interpolate(localFrame, [70, 85], [0, 1], { extrapolateRight: "clamp" });

  const cmdStyle = { 
    backgroundColor: "#161b22", 
    padding: "14px 28px", 
    borderRadius: 8,
    border: "1px solid #30363d",
    fontSize: 24,
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      height: "100%",
      gap: 24,
    }}>
      <div style={{ opacity: brewOpacity, ...cmdStyle }}>
        <span style={{ color: "#7ee787" }}>$</span>
        <span style={{ color: "#e6edf3" }}> brew tap </span>
        <span style={{ color: "#ffa657" }}>basiclines/tap</span>
        <span style={{ color: "#8b949e" }}> && </span>
        <span style={{ color: "#e6edf3" }}>brew install </span>
        <span style={{ color: "#ffa657" }}>rampa</span>
      </div>

      <div style={{ opacity: npmOpacity, ...cmdStyle }}>
        <span style={{ color: "#7ee787" }}>$</span>
        <span style={{ color: "#e6edf3" }}> npm install </span>
        <span style={{ color: "#79c0ff" }}>-g</span>
        <span style={{ color: "#ffa657" }}> rampa</span>
      </div>

      <div style={{ opacity: skillsOpacity, marginTop: 20, ...cmdStyle }}>
        <span style={{ color: "#7ee787" }}>$</span>
        <span style={{ color: "#e6edf3" }}> npx </span>
        <span style={{ color: "#ffa657" }}>rampa-skill</span>
        <span style={{ color: "#e6edf3" }}> install</span>
        <span style={{ color: "#8b949e", marginLeft: 16 }}># AI agent skills</span>
      </div>
    </div>
  );
};

export const RampaIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene boundaries
  const INSTALL_START = 600;
  const END = 780;

  // Install scene
  if (frame >= INSTALL_START) {
    return (
      <Terminal>
        <InstallScene startFrame={INSTALL_START} />
      </Terminal>
    );
  }

  // Command demo scenes
  const sceneIndex = commandTimeline.findIndex(s => frame < s.end);
  const scene = commandTimeline[sceneIndex === -1 ? commandTimeline.length - 1 : sceneIndex];

  const additionProgress = Math.max(0, frame - scene.additionStart);
  const charsToShow = Math.floor(additionProgress * 0.5);
  const visibleAddition = scene.addition.slice(0, Math.min(charsToShow, scene.addition.length));
  const isTyping = charsToShow < scene.addition.length && frame >= scene.additionStart;
  const fullCommand = scene.base + visibleAddition;
  const cursorVisible = isTyping && Math.sin(frame * 0.3) > 0;

  return (
    <Terminal>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ color: "#7ee787", marginRight: 12 }}>$</span>
        <span><HighlightedCommand text={fullCommand} /></span>
        {cursorVisible && (
          <span style={{
            display: "inline-block",
            width: 12,
            height: 24,
            backgroundColor: "#e6edf3",
            marginLeft: 2,
          }} />
        )}
      </div>
      <ColorOutput colors={scene.colors} startFrame={scene.colorStart} />
    </Terminal>
  );
};
