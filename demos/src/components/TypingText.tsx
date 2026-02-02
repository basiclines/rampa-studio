import React from "react";
import { useCurrentFrame } from "remotion";

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

  // Parse command to highlight flags and values
  const highlightCommand = (cmd: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(-[A-Za-z]|--[a-z-]+)(=?)("[^"]*"|[^\s]*)?|\S+/g;
    let match;
    let key = 0;

    while ((match = regex.exec(cmd)) !== null) {
      const [full, flag, equals, value] = match;

      if (flag) {
        // It's a flag
        parts.push(
          <span key={key++} style={{ color: "#79c0ff" }}>
            {flag}
          </span>
        );
        if (equals) {
          parts.push(
            <span key={key++} style={{ color: "#e6edf3" }}>
              =
            </span>
          );
        }
        if (value) {
          parts.push(
            <span key={key++} style={{ color: "#ffa657" }}>
              {value}
            </span>
          );
        }
      } else if (full === "rampa") {
        // Command name
        parts.push(
          <span key={key++} style={{ color: "#d2a8ff" }}>
            {full}
          </span>
        );
      } else {
        parts.push(
          <span key={key++} style={{ color: "#e6edf3" }}>
            {full}
          </span>
        );
      }
      parts.push(<span key={key++}> </span>);
    }

    return parts;
  };

  const charsPerFrame = 0.5;
  const framesSinceStart = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor(framesSinceStart * charsPerFrame);
  const visibleCommand = command.slice(0, charsToShow);
  const isTyping = charsToShow < command.length && frame >= startFrame;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {showPrompt && frame >= startFrame && (
        <span style={{ color: "#7ee787", marginRight: 12 }}>$</span>
      )}
      <span>{highlightCommand(visibleCommand)}</span>
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
