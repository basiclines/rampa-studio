export interface Range {
  start: number;
  end: number;
}

/**
 * Parses a range string like "10:90" or "-15:15" or single value "50"
 * @param input - Range string in format "start:end" or single value
 * @param name - Name of the flag for error messages
 * @returns Parsed range object
 */
export function parseRange(input: string, name: string): Range {
  const trimmed = input.trim();
  
  // Single value: "50" → { start: 50, end: 50 }
  if (!trimmed.includes(':')) {
    const value = parseFloat(trimmed);
    if (isNaN(value)) {
      throw new Error(`Invalid ${name} value "${input}". Expected a number or range like "10:90"`);
    }
    return { start: value, end: value };
  }

  // Range value: "10:90" or "-15:15"
  const parts = trimmed.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid ${name} range "${input}". Use format "start:end" (e.g., "10:90")`);
  }

  const start = parseFloat(parts[0]);
  const end = parseFloat(parts[1]);

  if (isNaN(start) || isNaN(end)) {
    throw new Error(`Invalid ${name} range "${input}". Both values must be numbers`);
  }

  return { start, end };
}

/**
 * Parses and validates a percentage range (0-100)
 */
export function parsePercentRange(input: string, name: string): Range {
  const range = parseRange(input, name);
  
  if (range.start < 0 || range.start > 100 || range.end < 0 || range.end > 100) {
    throw new Error(`${name} values must be between 0 and 100, got "${input}"`);
  }
  
  return range;
}

/**
 * Parses hue range (allows negative values for hue shift)
 */
export function parseHueRange(input: string): Range {
  return parseRange(input, 'hue');
}
