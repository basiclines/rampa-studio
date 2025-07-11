import * as React from "react";
import { Button, ButtonProps } from "./button";

interface CopyButtonProps extends ButtonProps {
  onCopy: () => void | Promise<void>;
  copiedText?: string;
  children: React.ReactNode;
}

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ onCopy, copiedText = "Copied", children, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.onClick) props.onClick(e);
      if (e.defaultPrevented) return;
      await onCopy();
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1000);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    return (
      <Button ref={ref} {...props} onClick={handleClick}>
        {copied ? copiedText : children}
      </Button>
    );
  }
);
CopyButton.displayName = "CopyButton"; 