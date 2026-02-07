import { RAMPA_VERSION } from './config.js';

export interface ModelResult {
  modelId: string;
  modelName: string;
  response: string;
  score?: Score;
  error?: string;
}

export interface Score {
  judgeScore?: number;       // 1-5
  judgeNotes?: string;
}

export interface EvalResult {
  promptName: string;
  prompt: string;
  date: string;
  rampaVersion: string;
  models: ModelResult[];
}

/** Generate a per-prompt eval report in markdown */
export function generateReport(result: EvalResult): string {
  const lines: string[] = [];

  lines.push(`# Eval: ${result.promptName}`);
  lines.push('');
  lines.push(`- **Date**: ${result.date}`);
  lines.push(`- **Rampa Version**: ${result.rampaVersion}`);
  lines.push(`- **Prompt**: ${result.promptName}`);
  lines.push('');
  lines.push('## Prompt');
  lines.push('');
  // Use 4-backtick fence so any ``` inside the prompt don't break rendering
  const escaped = result.prompt.trim().replaceAll('```', '~~~');
  lines.push('````');
  lines.push(escaped);
  lines.push('````');
  lines.push('');

  for (const model of result.models) {
    lines.push(`---`);
    lines.push('');
    lines.push(`## Model: ${model.modelName} (\`${model.modelId}\`)`);
    lines.push('');

    if (model.error) {
      lines.push(`> [!] Error: ${model.error}`);
      lines.push('');
      continue;
    }

    lines.push('### Response');
    lines.push('');
    lines.push('<details>');
    lines.push('<summary>Full model response</summary>');
    lines.push('');
    lines.push(model.response);
    lines.push('');
    lines.push('</details>');
    lines.push('');

    if (model.score) {
      lines.push('### Score');
      lines.push('');
      if (model.score.judgeScore !== undefined) {
        lines.push(`- **Judge Score**: ${model.score.judgeScore}/5`);
      }
      if (model.score.judgeNotes) {
        lines.push(`- **Judge Notes**: ${model.score.judgeNotes}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/** Generate a cross-prompt summary */
export function generateSummary(results: EvalResult[]): string {
  const lines: string[] = [];

  lines.push('# Eval Summary');
  lines.push('');
  lines.push(`- **Date**: ${results[0]?.date ?? new Date().toISOString()}`);
  lines.push(`- **Rampa Version**: ${RAMPA_VERSION}`);
  lines.push(`- **Prompts Evaluated**: ${results.length}`);
  lines.push('');

  // Build comparison table
  if (results.length > 0 && results[0].models.length > 0) {
    const modelNames = results[0].models.map(m => m.modelName);
    const header = `| Prompt | ${modelNames.join(' | ')} |`;
    const sep = `|-------|${modelNames.map(() => '-------').join('|')}|`;

    lines.push(header);
    lines.push(sep);

    for (const r of results) {
      const cells = r.models.map(m => {
        if (m.error) return '[!] error';
        if (!m.score) return '—';
        if (m.score.judgeScore !== undefined) return `${m.score.judgeScore}/5`;
        return '[+]';
      });
      lines.push(`| ${r.promptName} | ${cells.join(' | ')} |`);
    }
    lines.push('');
  }

  lines.push('');
  return lines.join('\n');
}
