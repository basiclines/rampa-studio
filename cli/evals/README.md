# Rampa AI Evals

Evaluate how different LLM models use the Rampa CLI tool by sending the same prompt to multiple models and comparing their approaches.

Models run in **agent mode with full tool access** — they can run `rampa --help`, execute commands, and iterate. How each model discovers and uses the CLI is part of the evaluation.

## Quick Start

```bash
# From the cli/ directory
bun run eval
```

## Commands

```bash
# Run all prompts against all models
bun run eval

# Run a single prompt
bun run eval --prompt ghostty-matrix-theme

# Run a single model
bun run eval --model claude-opus-4.6

# Run without rampa (baseline comparison)
bun run eval --prompt ghostty-matrix-theme --raw

# Set reasoning effort for all models (low, medium, high, xhigh)
bun run eval --effort high

# Combine filters
bun run eval --prompt ghostty-matrix-theme --model gpt-5.2-codex

# Skip LLM-as-judge scoring (faster)
bun run eval --no-judge

# Show help
bun run eval --help
```

## How It Works

1. Reads each prompt file from `prompts/`
2. If a matching skill exists in `../skills/`, includes its `SKILL.md` as context
3. Sends the prompt to each model in parallel via the GitHub Copilot SDK (agent mode with tools)
4. Models can use tools (bash, view, grep, etc.) to discover rampa and run commands
5. Scores results via optional LLM-as-judge
6. Writes markdown reports + raw JSON to `results/<date>/<prompt>/`
7. Each model's generated files are saved in `output-<model-id>/` subdirectories

## Raw Mode (--raw)

Run the same prompts **without rampa** to compare baseline model behavior:

```bash
# With rampa (models discover and use the CLI)
bun run eval --prompt ghostty-matrix-theme --no-judge

# Without rampa (models use their own knowledge)
bun run eval --prompt ghostty-matrix-theme --no-judge --raw
```

In `--raw` mode, all rampa-specific instructions are stripped from the prompt. Results are saved to `results/<date>-raw/` so both runs sit side by side for comparison.

## Prompts

Each `.md` file in `prompts/` is a standalone eval prompt:

```
prompts/
├── ghostty-matrix-theme.md    # Matrix-style Ghostty terminal theme
├── slack-minimal-theme.md     # Clean minimal Slack sidebar theme
├── fundure-website.md         # Static Tailwind site with token/semantic colors
└── vscode-purple-dimmed.md    # Purple variant of GitHub Dark Dimmed
```

To add a new eval, create a new `.md` file in `prompts/`.

## Models

Configured in `src/config.ts`:

| Model ID | Name |
|----------|------|
| `claude-opus-4.6` | Claude Opus 4.6 |
| `gpt-5.2-codex` | GPT-5.2 Codex |
| `gemini-3-pro-preview` | Gemini 3 Pro |

Each model can have a default `reasoningEffort` (`low`, `medium`, `high`, `xhigh`). The `--effort` CLI flag overrides all models for that run.

## Results Structure

```
results/
├── 2026-02-07/                           # rampa-enabled runs
│   ├── summary.md
│   └── ghostty-matrix-theme/
│       ├── eval-report.md
│       ├── eval-data.json
│       ├── output-claude-opus-4.6/       # model-generated files
│       ├── output-gpt-5.2-codex/
│       └── output-gemini-3-pro-preview/
└── 2026-02-07-raw/                       # raw (no-rampa) runs
    ├── summary.md
    └── ghostty-matrix-theme/
        └── ...
```

Results are gitignored.

## Prerequisites

- [GitHub Copilot CLI](https://github.com/github/copilot-cli) installed and authenticated (`copilot auth login`)
- Bun runtime
