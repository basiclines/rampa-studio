import pc from 'picocolors';

export interface ModelStatus {
  name: string;
  id: string;
  state: 'waiting' | 'running' | 'done' | 'error';
  lastTool: string;
  toolCount: number;
  startTime: number;
  endTime?: number;
  inputTokens: number;
  outputTokens: number;
  error?: string;
}

// Column widths (plain text characters, excluding ANSI codes)
const COL_NAME = 22;
const COL_TOOLS = 16;
const COL_TOKENS = 28;
const COL_TIME = 8;

/**
 * Compact terminal dashboard for parallel model evals.
 * Re-renders a fixed block of lines using ANSI cursor movement.
 */
export class Display {
  private models: Map<string, ModelStatus> = new Map();
  private lineCount = 0;
  private isTTY = process.stdout.isTTY ?? false;

  addModel(id: string, name: string) {
    this.models.set(id, {
      name,
      id,
      state: 'waiting',
      lastTool: '',
      toolCount: 0,
      startTime: Date.now(),
      inputTokens: 0,
      outputTokens: 0,
    });
  }

  update(id: string, patch: Partial<ModelStatus>) {
    const model = this.models.get(id);
    if (!model) return;
    Object.assign(model, patch);
    this.render();
  }

  private render() {
    if (!this.isTTY) return;

    // Move cursor up to overwrite previous render
    if (this.lineCount > 0) {
      process.stdout.write(`\x1b[${this.lineCount}A`);
    }

    const lines: string[] = [];

    for (const m of this.models.values()) {
      const elapsed = pad(formatDuration(m.endTime ?? Date.now(), m.startTime), COL_TIME, 'right');
      const name = pad(m.name, COL_NAME);

      switch (m.state) {
        case 'waiting':
          lines.push(`  ${pc.dim('[ ]')} ${pc.dim(name)}${pc.dim(pad('', COL_TOOLS))}${pc.dim(pad('waiting...', COL_TOKENS))}${pc.dim(elapsed)}`);
          break;
        case 'running': {
          const tool = m.lastTool || 'thinking...';
          const tools = m.toolCount > 0 ? `${m.toolCount} tool calls` : '';
          lines.push(`  ${pc.yellow('[-]')} ${pc.white(name)}${pc.dim(pad(tools, COL_TOOLS))}${pc.cyan(pad(tool, COL_TOKENS))}${pc.dim(elapsed)}`);
          break;
        }
        case 'done': {
          const tools = m.toolCount > 0 ? `${m.toolCount} tool calls` : '';
          const tokens = formatTokens(m.inputTokens, m.outputTokens);
          lines.push(`  ${pc.green('[+]')} ${pc.green(name)}${pc.dim(pad(tools, COL_TOOLS))}${pc.dim(pad(tokens, COL_TOKENS))}${pc.dim(elapsed)}`);
          break;
        }
        case 'error': {
          const msg = m.error ?? 'failed';
          lines.push(`  ${pc.red('[x]')} ${pc.red(name)}${pc.red(pad('', COL_TOOLS))}${pc.red(pad(msg, COL_TOKENS))}${pc.dim(elapsed)}`);
          break;
        }
      }
    }

    const output = lines.map(l => `\x1b[2K${l}`).join('\n') + '\n';
    process.stdout.write(output);
    this.lineCount = lines.length;
  }

  /** Final render after all models complete — no more ANSI overwrites */
  finish() {
    if (!this.isTTY) {
      for (const m of this.models.values()) {
        const elapsed = formatDuration(m.endTime ?? Date.now(), m.startTime);
        const status = m.state === 'done' ? '[+]' : m.state === 'error' ? '[x]' : '[-]';
        const tools = m.toolCount > 0 ? `${m.toolCount} tool calls` : '';
        const tokens = formatTokens(m.inputTokens, m.outputTokens);
        console.log(`  ${status} ${pad(m.name, COL_NAME)}${pad(tools, COL_TOOLS)}${pad(tokens, COL_TOKENS)}${pad(elapsed, COL_TIME, 'right')}`);
      }
    }
  }

  /** Print file output paths as dim metadata, visually separated from the dashboard */
  meta(lines: string[]) {
    console.log('');
    for (const line of lines) {
      console.log(pc.dim(`  ${line}`));
    }
  }
}

function formatDuration(end: number, start: number): string {
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}m${rem}s`;
}

function formatTokens(input: number, output: number): string {
  if (input === 0 && output === 0) return 'no token data';
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  return `${pad(fmt(input), 8, 'right')} in · ${pad(fmt(output), 7, 'right')} out`;
}

/** Pad or truncate a string to exactly `len` characters */
function pad(s: string, len: number, align: 'left' | 'right' = 'left'): string {
  if (s.length > len) return s.slice(0, len);
  const space = ' '.repeat(len - s.length);
  return align === 'left' ? s + space : space + s;
}
