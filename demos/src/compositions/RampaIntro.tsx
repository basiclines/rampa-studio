import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Terminal } from "../components/Terminal";
import { CommandLine } from "../components/TypingText";
import { ColorOutput } from "../components/ColorSwatch";

// Pre-generated color outputs for each command
const COLORS_SIZE_5 = [
  "#000000",
  "#1a3a5c",
  "#3b6a9e",
  "#7da4cc",
  "#ffffff",
];

const COLORS_SIZE_10 = [
  "#000000",
  "#0d2540",
  "#1a3a5c",
  "#2a5278",
  "#3b6a9e",
  "#5a89b8",
  "#7da4cc",
  "#a3c1de",
  "#ccddef",
  "#ffffff",
];

const COLORS_LIGHTNESS = [
  "#1a3552",
  "#234469",
  "#2d5580",
  "#3b6a9e",
  "#5282b5",
  "#6d9ac7",
  "#8ab0d5",
  "#a7c5e1",
  "#c4daec",
  "#d9e8f4",
];

const COLORS_FULL = [
  "#1e3a52",
  "#27496a",
  "#325a82",
  "#3f6c9a",
  "#4e7fb2",
  "#6090c0",
  "#75a0cb",
  "#8cb0d3",
  "#a5c0da",
  "#c0d2e2",
];

interface CommandBlockProps {
  command: string;
  colors: string[];
  commandStart: number;
  outputStart: number;
  visible: boolean;
}

const CommandBlock: React.FC<CommandBlockProps> = ({
  command,
  colors,
  commandStart,
  outputStart,
  visible,
}) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const opacity = interpolate(frame, [commandStart - 5, commandStart], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity }}>
      <CommandLine command={command} startFrame={commandStart} />
      <ColorOutput colors={colors} startFrame={outputStart} />
    </div>
  );
};

export const RampaIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Timeline (in frames at 30fps)
  // Scene 1: 0-120 (4 sec) - size=5
  // Scene 2: 120-240 (4 sec) - size=10
  // Scene 3: 240-360 (4 sec) - lightness
  // Scene 4: 360-510 (5 sec) - full + hold

  const scenes = [
    {
      command: 'rampa -C "#3b82f6" --size=5',
      colors: COLORS_SIZE_5,
      startFrame: 0,
      endFrame: 120,
    },
    {
      command: 'rampa -C "#3b82f6" --size=10',
      colors: COLORS_SIZE_10,
      startFrame: 120,
      endFrame: 240,
    },
    {
      command: 'rampa -C "#3b82f6" --size=10 -L 15:85',
      colors: COLORS_LIGHTNESS,
      startFrame: 240,
      endFrame: 360,
    },
    {
      command: 'rampa -C "#3b82f6" --size=10 -L 15:85 -S 90:20 -H -15:15',
      colors: COLORS_FULL,
      startFrame: 360,
      endFrame: 510,
    },
  ];

  // Find current scene
  const currentSceneIndex = scenes.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );
  const currentScene = scenes[currentSceneIndex] || scenes[scenes.length - 1];

  // Calculate typing duration based on command length
  const commandTypingDuration = Math.ceil(currentScene.command.length / 0.5);

  return (
    <Terminal>
      <CommandBlock
        command={currentScene.command}
        colors={currentScene.colors}
        commandStart={currentScene.startFrame + 10}
        outputStart={currentScene.startFrame + 10 + commandTypingDuration + 15}
        visible={true}
      />
    </Terminal>
  );
};
