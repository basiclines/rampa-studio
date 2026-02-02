import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface TypingTextProps {
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  startFrame,
  charsPerFrame = 0.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const framesSinceStart = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor(framesSinceStart * charsPerFrame);
  const visibleText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length && frame >= startFrame;

  return (
    <span style={style}>
      {visibleText}
      {isTyping && (
        <span
          style={{
            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            backgroundColor: "#e6edf3",
            marginLeft: 2,
          }}
        >
          &nbsp;
        </span>
      )}
    </span>
  );
};

// Token types for syntax highlighting
type TokenType = "command" | "flag" | "equals" | "value" | "space";

interface Token {
  type: TokenType;
  value: string;
}

// Parse command into tokens
const tokenize = (cmd: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /(-[A-Za-z]|--[a-z-]+)(=?)("[^"]*"|[^\s]*)?|(\s+)|(\S+)/g;
  let match;

  while ((match = regex.exec(cmd)) !== null) {
    const [full, flag, equals, value, space, other] = match;

    if (space) {
      tokens.push({ type: "space", value: space });
    } else if (flag) {
      tokens.push({ type: "flag", value: flag });
      if (equals) tokens.push({ type: "equals", value: "=" });
      if (value) tokens.push({ type: "value", value });
      tokens.push({ type: "space", value: " " });
    } else if (other === "rampa") {
      tokens.push({ type: "command", value: other });
      tokens.push({ type: "space", value: " " });
    } else if (other) {
      tokens.push({ type: "value", value: other });
      tokens.push({ type: "space", value: " " });
    }
  }
  return tokens;
};

const getTokenColor = (type: TokenType): string => {
  switch (type) {
    case "command": return "#d2a8ff";
    case "flag": return "#79c0ff";
    case "value": return "#ffa657";
    default: return "#e6edf3";
  }
};

interface CommandLineProps {
  command: string;
  startFrame: number;
  showPrompt?: boolean;
}

export const CommandLine: React.FC<CommandLineProps> = ({
  command,
  startFrame,
  showPrompt = true,
}) => {
  const frame = useCurrentFrame();

  const charsPerFrame = 0.5;
  const framesSinceStart = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor(framesSinceStart * charsPerFrame);
  const visibleCommand = command.slice(0, charsToShow);
  const isTyping = charsToShow < command.length && frame >= startFrame;
  
  const tokens = tokenize(visibleCommand);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {showPrompt && frame >= startFrame && (
        <span style={{ color: "#7ee787", marginRight: 12 }}>$</span>
      )}
      <span>
        {tokens.map((token, i) => (
          <span key={i} style={{ color: getTokenColor(token.type) }}>
            {token.value}
          </span>
        ))}
      </span>
      {isTyping && (
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 24,
            backgroundColor: "#e6edf3",
            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            marginLeft: 2,
          }}
        />
      )}
    </div>
  );
};

// Morphing command - shows base command, then types only the new parts
interface MorphingCommandProps {
  baseCommand: string;
  additions: { text: string; startFrame: number }[];
  initialTypeFrame: number;
}

export const MorphingCommand: React.FC<MorphingCommandProps> = ({
  baseCommand,
  additions,
  initialTypeFrame,
}) => {
  const frame = useCurrentFrame();
  
  // Type base command first
  const baseTypingDuration = Math.ceil(baseCommand.length / 0.5);
  const baseComplete = frame >= initialTypeFrame + baseTypingDuration;
  
  // Calculate what's visible
  let fullCommand = baseCommand;
  let typingAddition: { text: string; progress: number } | null = null;
  
  for (const addition of additions) {
    if (frame >= addition.startFrame) {
      const additionProgress = Math.floor((frame - addition.startFrame) * 0.5);
      const visibleAddition = addition.text.slice(0, additionProgress);
      
      if (additionProgress < addition.text.length) {
        typingAddition = { text: visibleAddition, progress: additionProgress };
        fullCommand += visibleAddition;
        break;
      } else {
        fullCommand += addition.text;
      }
    }
  }
  
  // Type base command with animation
  const baseFramesSinceStart = Math.max(0, frame - initialTypeFrame);
  const baseCharsToShow = Math.floor(baseFramesSinceStart * 0.5);
  const visibleBase = baseCommand.slice(0, Math.min(baseCharsToShow, baseCommand.length));
  
  const isTyping = !baseComplete || typingAddition !== null;
  const tokens = tokenize(fullCommand.slice(0, baseComplete ? fullCommand.length : visibleBase.length));
  
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ color: "#7ee787", marginRight: 12 }}>$</span>
      <span>
        {tokens.map((token, i) => (
          <span key={i} style={{ color: getTokenColor(token.type) }}>
            {token.value}
          </span>
        ))}
      </span>
      {isTyping && frame >= initialTypeFrame && (
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 24,
            backgroundColor: "#e6edf3",
            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            marginLeft: 2,
          }}
        />
      )}
    </div>
  );
};
