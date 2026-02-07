import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

export const RAMPA_VERSION = pkg.version as string;

export const SKILLS_DIR = join(__dirname, '../../../skills');
export const PROMPTS_DIR = join(__dirname, '../prompts');
export const RESULTS_DIR = join(__dirname, '../results');

import type { ReasoningEffort } from '@github/copilot-sdk';

export interface ModelConfig {
  id: string;
  name: string;
  reasoningEffort?: ReasoningEffort;
}

export const MODELS: ModelConfig[] = [
  { id: 'claude-opus-4.6',       name: 'Claude Opus 4.6' },
  { id: 'gpt-5.2-codex',         name: 'GPT-5.2 Codex' },
  { id: 'gemini-3-pro-preview',  name: 'Gemini 3 Pro' },
];

// Model used for LLM-as-judge scoring
export const JUDGE_MODEL = 'claude-opus-4.6';
