# Rampa Demo Videos

Animated demo videos for Rampa CLI, built with [Remotion](https://remotion.dev).

## Setup

```bash
cd demos
bun install
```

## Development

Preview videos in Remotion Studio:

```bash
bun run dev
```

## Render

Render a video:

```bash
bunx remotion render RampaIntro --output=out/rampa-intro.mp4
```

Render a still frame (for thumbnails):

```bash
bunx remotion still RampaIntro --frame=100 --output=thumbnail.png
```

## Available Compositions

| ID | Description | Duration |
|----|-------------|----------|
| `RampaIntro` | CLI demo with 4 progressive commands | 17s |

## Project Structure

```
demos/
├── src/
│   ├── components/
│   │   ├── Terminal.tsx      # Terminal window styling
│   │   ├── TypingText.tsx    # Typing animation
│   │   └── ColorSwatch.tsx   # Color output display
│   ├── compositions/
│   │   └── RampaIntro.tsx    # Main demo video
│   └── Root.tsx              # Remotion entry point
├── out/                      # Rendered videos
└── package.json
```

## Creating New Demos

1. Create a new composition in `src/compositions/`
2. Register it in `src/Root.tsx`
3. Render with `bunx remotion render <CompositionId>`
