export const OUTPUT_FORMATS = ['text', 'json', 'css'] as const;
export type OutputFormat = typeof OUTPUT_FORMATS[number];

export function isValidOutputFormat(format: string): format is OutputFormat {
  return OUTPUT_FORMATS.includes(format as OutputFormat);
}
