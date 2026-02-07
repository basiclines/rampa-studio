#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { readFileSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';
import { CopilotClient } from '@github/copilot-sdk';
import {
  MODELS, SKILLS_DIR, PROMPTS_DIR, RESULTS_DIR,
  RAMPA_VERSION, type ModelConfig,
} from './config.js';
import { generateReport, generateSummary, type EvalResult, type ModelResult } from './report.js';
import { scoreResult } from './scoring.js';
import { Display } from './display.js';

/**
 * Resolve the system-installed `copilot` CLI binary path (skips node_modules shims).
 *
 * Why this is needed (as of Bun 1.3 / Copilot SDK 0.1.23):
 * The SDK defaults to the bundled `@github/copilot/npm-loader.js` which is a JS shim
 * that requires Node.js v24+. Bun's embedded Node runtime is v20, so the shim crashes
 * silently — the CLI process exits and no model events are ever emitted.
 *
 * Workaround: find the native `copilot` binary on the system PATH, filtering out
 * `node_modules/.bin` to avoid hitting the broken JS shim.
 *
 * TODO: Remove this workaround when Bun ships Node v24+ compat or the SDK fixes
 * the bundled loader to work with Bun natively.
 */
async function findCopilotCli(): Promise<string> {
  const systemPath = (process.env.PATH ?? '')
    .split(':')
    .filter(p => !p.includes('node_modules'))
    .join(':');

  const resolved = Bun.which('copilot', { PATH: systemPath });
  if (!resolved) {
    throw new Error(
      'Could not find `copilot` CLI on your system PATH.\n'
      + 'Install it and run `copilot auth login` first.\n'
      + 'See: https://github.com/github/copilot-cli',
    );
  }
  return resolved;
}

// --- CLI args ---
const { values: args } = parseArgs({
  options: {
    prompt:    { type: 'string', short: 'p' },
    model:     { type: 'string', short: 'm' },
    effort:    { type: 'string', short: 'e' },
    raw:       { type: 'boolean', default: false },
    'no-judge': { type: 'boolean', default: false },
    help:      { type: 'boolean', short: 'h' },
  },
  strict: false,
});

if (args.help) {
  console.log(`
rampa eval runner

Usage: bun run eval [options]

Options:
  -p, --prompt <name>   Run eval for a single prompt (default: all in prompts/)
  -m, --model <id>      Run eval with a single model (default: all)
  -e, --effort <level>  Reasoning effort: low, medium, high, xhigh (overrides config)
  --raw                 Run without rampa — strips rampa instructions from prompts
  --no-judge            Skip LLM-as-judge scoring
  -h, --help            Show this help

Examples:
  bun run eval
  bun run eval --prompt ghostty-matrix-theme
  bun run eval --prompt ghostty-matrix-theme --model gpt-5.2-codex
  bun run eval --prompt ghostty-matrix-theme --raw
  bun run eval --effort high
  bun run eval --no-judge
`);
  process.exit(0);
}

// --- Discover prompts ---
function getPromptNames(): string[] {
  return readdirSync(PROMPTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

function loadPrompt(name: string): string {
  const promptPath = join(PROMPTS_DIR, `${name}.md`);
  if (!existsSync(promptPath)) throw new Error(`Prompt file not found: ${promptPath}`);
  return readFileSync(promptPath, 'utf-8').trim();
}

/** Load skill content if a matching skill directory exists, otherwise return null. */
function loadSkillContent(name: string): string | null {
  const skillPath = join(SKILLS_DIR, name, 'SKILL.md');
  if (!existsSync(skillPath)) return null;
  return readFileSync(skillPath, 'utf-8');
}

// --- Main ---
async function main() {
  const date = new Date().toISOString().slice(0, 10);
  // Separate results folder for raw (no-rampa) runs
  const dateDir = join(RESULTS_DIR, args.raw ? `${date}-raw` : date);

  // Filter prompts and models
  const allPrompts = getPromptNames();
  const prompts = args.prompt ? allPrompts.filter(p => p === args.prompt) : allPrompts;
  if (prompts.length === 0) {
    console.error(pc.red(`[x] Prompt "${args.prompt}" not found. Available: ${allPrompts.join(', ')}`));
    process.exit(1);
  }

  const models = args.model
    ? MODELS.filter(m => m.id === args.model)
    : MODELS;
  if (models.length === 0) {
    console.error(pc.red(`[x] Model "${args.model}" not found. Available: ${MODELS.map(m => m.id).join(', ')}`));
    process.exit(1);
  }

  // Validate and apply --effort flag override
  const VALID_EFFORTS = ['low', 'medium', 'high', 'xhigh'] as const;
  type Effort = typeof VALID_EFFORTS[number];
  const effortOverride = args.effort as Effort | undefined;
  if (effortOverride && !VALID_EFFORTS.includes(effortOverride)) {
    console.error(pc.red(`[x] Invalid effort "${args.effort}". Valid: ${VALID_EFFORTS.join(', ')}`));
    process.exit(1);
  }

  // Apply effort override to all models, or use per-model config defaults
  const modelsWithEffort = models.map(m => ({
    ...m,
    reasoningEffort: effortOverride ?? m.reasoningEffort,
  }));

  const isRaw = args.raw ?? false;

  console.log('');
  console.log(pc.bold(pc.cyan(`  Rampa Eval Runner v${RAMPA_VERSION}`)));
  console.log(pc.dim(`  Date:    ${date}`));
  console.log(pc.dim(`  Prompts: ${prompts.join(', ')}`));
  console.log(pc.dim(`  Models:  ${modelsWithEffort.map(m => m.name).join(', ')}`));
  console.log(pc.dim(`  Effort:  ${effortOverride ?? 'per-model config'}`));
  console.log(pc.dim(`  Mode:    ${isRaw ? 'raw (no rampa)' : 'rampa'}`));
  console.log(pc.dim(`  Judge:   ${args['no-judge'] ? 'disabled' : 'enabled'}`));
  console.log('');

  // Start Copilot SDK client — use system `copilot` CLI (the bundled @github/copilot
  // package may be a different version that doesn't work with stdio correctly).
  const cliPath = await findCopilotCli();
  const client = new CopilotClient({ cliPath });

  const allResults: EvalResult[] = [];

  try {
    for (const promptName of prompts) {
      console.log(pc.bold(`  ▸ Evaluating prompt: ${promptName}`));
      const prompt = loadPrompt(promptName);
      const skillContent = loadSkillContent(promptName);

      const evalResult: EvalResult = {
        promptName: promptName,
        prompt,
        date: new Date().toISOString(),
        rampaVersion: RAMPA_VERSION,
        models: [],
      };

      // Create prompt output directory before launching models
      const promptDir = join(dateDir, promptName);
      mkdirSync(promptDir, { recursive: true });

      // Set up live display
      const display = new Display();
      for (const model of modelsWithEffort) {
        display.addModel(model.id, model.name);
      }

      // Create per-model output directories and run all models in parallel
      const modelPromises = modelsWithEffort.map(async (model) => {
        const modelOutputDir = join(promptDir, `output-${model.id}`);
        mkdirSync(modelOutputDir, { recursive: true });
        display.update(model.id, { state: 'running' });
        try {
          const modelResult = await runModelEval(client, model, skillContent, prompt, promptName, modelOutputDir, display, isRaw);
          display.update(model.id, {
            state: 'done',
            endTime: Date.now(),
          });
          return modelResult;
        } catch (err) {
          display.update(model.id, {
            state: 'error',
            endTime: Date.now(),
            error: err instanceof Error ? err.message : String(err),
          });
          throw err;
        }
      });

      evalResult.models = await Promise.all(modelPromises);
      display.finish();

      // Write per-prompt report
      const reportMd = generateReport(evalResult);
      writeFileSync(join(promptDir, 'eval-report.md'), reportMd);

      // Also save raw JSON
      writeFileSync(join(promptDir, 'eval-data.json'), JSON.stringify(evalResult, null, 2));

      display.meta([
        `report:  ${promptDir}/eval-report.md`,
        `data:    ${promptDir}/eval-data.json`,
      ]);

      allResults.push(evalResult);
    }

    // Write summary
    if (allResults.length > 0) {
      mkdirSync(dateDir, { recursive: true });
      const summary = generateSummary(allResults);
      writeFileSync(join(dateDir, 'summary.md'), summary);
      console.log(pc.dim(`  summary: ${dateDir}/summary.md`));
    }
  } finally {
    // Race client.stop() with a timeout — the copilot CLI process can hang on shutdown
    await Promise.race([
      client.stop(),
      new Promise(resolve => setTimeout(resolve, 3_000)),
    ]);
  }

  console.log(pc.bold(pc.green('\n  Done.\n')));
  process.exit(0);
}

async function runModelEval(
  client: CopilotClient,
  model: ModelConfig,
  skillContent: string | null,
  prompt: string,
  promptName: string,
  outputDir: string,
  display: Display,
  isRaw: boolean,
): Promise<ModelResult> {
  const result: ModelResult = {
    modelId: model.id,
    modelName: model.name,
    response: '',
  };

  try {
    const session = await client.createSession({
      model: model.id,
      ...(model.reasoningEffort && { reasoningEffort: model.reasoningEffort }),
      onPermissionRequest: async () => ({ kind: 'approved' as const }),
    });

    try {
      // Build the full prompt with skill context
      const fullPrompt = buildPrompt(skillContent, prompt, outputDir, isRaw);

      // Use send() + event listeners instead of sendAndWait() to avoid hardcoded timeouts.
      // We wait for the session.idle event which fires when the model is truly done.
      const response = await new Promise<string>((resolve, reject) => {
        let content = '';
        let toolCount = 0;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        const unsubscribe = session.on((event) => {
          switch (event.type) {
            case 'assistant.message':
              content = event.data.content;
              break;

            case 'session.idle':
              unsubscribe();
              resolve(content);
              break;

            case 'session.error':
              unsubscribe();
              reject(new Error(event.data.message));
              break;

            case 'tool.execution_start':
              toolCount++;
              display.update(model.id, {
                lastTool: event.data.toolName,
                toolCount,
              });
              break;

            case 'assistant.usage':
              totalInputTokens += event.data.inputTokens ?? 0;
              totalOutputTokens += event.data.outputTokens ?? 0;
              display.update(model.id, {
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
              });
              break;

            case 'session.shutdown': {
              // Final authoritative token counts from session metrics
              const metrics = event.data.modelMetrics;
              if (metrics) {
                let finalIn = 0, finalOut = 0;
                for (const m of Object.values(metrics)) {
                  finalIn += m.usage.inputTokens;
                  finalOut += m.usage.outputTokens;
                }
                display.update(model.id, {
                  inputTokens: finalIn,
                  outputTokens: finalOut,
                });
              }
              break;
            }
          }
        });

        session.send({ prompt: fullPrompt }).catch(reject);
      });

      result.response = response;

      // Score via LLM-as-judge if enabled
      if (!args['no-judge']) {
        result.score = await scoreResult(client, promptName, prompt, result);
      }
    } finally {
      await session.destroy();
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

function buildPrompt(skillContent: string | null, userPrompt: string, outputDir: string, isRaw: boolean): string {
  const outputRules = `

IMPORTANT — Output rules:
1. Save any output files (themes, configs, generated assets, etc.) to: ${outputDir}
   Do NOT write files anywhere else.
2. Your final response MUST include:
   - Your reasoning for the color choices you made
   - Any artifacts created (file paths)
   This ensures the eval captures your full reasoning, not just the final result.`;

  if (isRaw) {
    // Strip rampa-specific instructions: remove lines mentioning rampa, --help, --add, harmony flags
    const stripped = userPrompt
      .split('\n')
      .filter(line => {
        const lower = line.toLowerCase();
        return !lower.includes('rampa') && !lower.includes('--add') && !lower.includes('--help');
      })
      .join('\n')
      // Clean up empty consecutive lines left by stripping
      .replace(/\n{3,}/g, '\n\n');

    return stripped + outputRules;
  }

  const rampaOutputRules = `

IMPORTANT — Output rules:
1. Save any output files (themes, configs, generated assets, etc.) to: ${outputDir}
   Do NOT write files anywhere else.
2. Your final response MUST include:
   - The rampa commands you ran and why (show the full commands)
   - How you chose each color from the rampa output
   - Any artifacts created (file paths)
   This ensures the eval captures your full reasoning, not just the final result.`;

  if (skillContent) {
    return `You are a color design assistant. You have access to the rampa CLI tool for generating color palettes.

Here is the skill documentation for how to use rampa for this task:

<skill>
${skillContent}
</skill>

User request: ${userPrompt}
${rampaOutputRules}

Respond with the appropriate rampa CLI command(s) and a brief explanation. Put commands in code blocks.`;
  }

  return userPrompt + rampaOutputRules;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
