// Auto-generated — do not edit. Run: node scripts/embed-preview-template.js
export const PREVIEW_TEMPLATE = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sarela — a warm, photo-derived color palette with 12 vivid hues for light & dark themes. Built with rampa from real photographs.">
  <meta name="theme-color" content="#1a1714">
  <meta property="og:title" content="Sarela — Bloom Colors">
  <meta property="og:description" content="A warm palette extracted from photographs — vivid hues grounded in natural tones. 12 colors, light & dark.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Sarela — Bloom Colors">
  <meta name="twitter:description" content="A warm, photo-derived color palette. 12 colors for light & dark terminal themes.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%231a1714'/><circle cx='35' cy='45' r='12' fill='%23dd1f46'/><circle cx='65' cy='45' r='12' fill='%233a72c9'/><circle cx='50' cy='65' r='12' fill='%23169483'/></svg>">
  <title>Sarela — Bloom Colors</title>
  <style>
    /* ── Dark theme: Sarela Night ── */
    :root, [data-theme="dark"] {
      --bg: #1a1714;
      --fg: #d5d0c8;
      --card-bg: #252220;
      --card-border: rgba(213, 208, 200, 0.08);
      --card-shadow: rgba(0, 0, 0, 0.25);
      --card-shadow-hover: rgba(0, 0, 0, 0.4);
      --muted: rgba(213, 208, 200, 0.45);
      --terminal-bg: #1a1714;
      --terminal-fg: #d5d0c8;
      --terminal-bar: rgba(255,255,255,0.06);

      --red: #dd1f46;
      --green: #5a8a33;
      --blue: #3a72c9;
      --yellow: #adab2e;
      --magenta: #c27db8;
      --cyan: #169483;
      --red-bright: #fb5668;
      --green-bright: #7aa859;
      --blue-bright: #5c92e5;
      --yellow-bright: #cccb5f;
      --magenta-bright: #e09fd5;
      --cyan-bright: #52b1a1;
    }

    /* ── Light theme: Sarela Day ── */
    [data-theme="light"] {
      --bg: #f5f2ed;
      --fg: #2a2520;
      --card-bg: #ffffff;
      --card-border: rgba(42, 37, 32, 0.08);
      --card-shadow: rgba(42, 37, 32, 0.07);
      --card-shadow-hover: rgba(42, 37, 32, 0.13);
      --muted: rgba(42, 37, 32, 0.5);
      --terminal-bg: #f5f2ed;
      --terminal-fg: #2a2520;
      --terminal-bar: rgba(0,0,0,0.06);

      --red: #b90235;
      --green: #437217;
      --blue: #225aaf;
      --yellow: #949204;
      --magenta: #a8659f;
      --cyan: #017a6b;
      --red-bright: #d61140;
      --green-bright: #54842c;
      --blue-bright: #346cc2;
      --yellow-bright: #a7a525;
      --magenta-bright: #bb77b2;
      --cyan-bright: #048e7d;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @media (prefers-reduced-motion: no-preference) {
      * { scroll-behavior: smooth; }
    }

    :focus-visible {
      outline: 2px solid var(--fg);
      outline-offset: 2px;
    }

    button:focus-visible, select:focus-visible, input:focus-visible {
      outline: 2px solid var(--magenta);
      outline-offset: 2px;
    }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: 'Georgia', 'Times New Roman', serif;
      min-height: 100vh;
      padding: 0;
      transition: background 0.4s ease, color 0.4s ease;
    }

    .container {
      max-width: 720px;
      margin: 0 auto;
      padding: 6rem 2rem 3rem;
    }

    /* ── Theme toggle ── */
    .theme-toggle {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 100;
      display: flex;
      gap: 0.2rem;
      padding: 0.25rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      backdrop-filter: blur(16px);
      box-shadow: 0 2px 12px var(--card-shadow);
    }

    .theme-toggle button {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border: none;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.25s ease;
      border-radius: 7px;
      letter-spacing: 0.02em;
    }

    .theme-toggle button.active {
      background: var(--fg);
      color: var(--bg);
      box-shadow: 0 1px 4px var(--card-shadow);
    }

    .theme-toggle button:not(.active):hover { color: var(--fg); }

    /* ── Header ── */
    header {
      text-align: left;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--card-border);
    }

    header h1 {
      font-family: 'Georgia', serif;
      font-size: 4rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      line-height: 1;
      margin-bottom: 0.3rem;
    }

    header .romanji {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.88rem;
      font-weight: 400;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 0.75rem;
    }

    header .subtitle {
      font-size: 1.1rem;
      font-style: italic;
      color: var(--muted);
      line-height: 1.5;
    }

    /* ── Intro ── */
    .intro {
      max-width: 100%;
      margin: 0 0 0.5rem;
      text-align: left;
      font-size: 1.05rem;
      line-height: 1.85;
      color: var(--fg);
      opacity: 0.75;
    }

    .intro-sig {
      margin: 0 0 3rem;
      text-align: left;
      font-size: 0.9rem;
      font-style: italic;
      color: var(--muted);
    }

    .intro-sig a {
      color: var(--fg);
      text-decoration: none;
      font-weight: 500;
    }

    .intro-sig a:hover { color: var(--magenta); }

    /* ── Section titles ── */
    .section-title {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-bottom: 1.25rem;
      color: var(--muted);
    }

    .section-divider {
      border: none;
      border-top: 1px solid var(--card-border);
      margin: 3rem 0 2rem;
    }

    /* ── Base row ── */
    .base-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .base-card {
      border-radius: 16px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 130px;
      transition: background 0.4s ease, color 0.4s ease;
    }

    .base-card .label { font-family: system-ui, sans-serif; font-weight: 600; font-size: 0.95rem; }
    .base-card .hex {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.82rem;
      opacity: 0.65;
      margin-top: 0.25rem;
    }

    .base-card.bg-card {
      background: var(--bg);
      color: var(--fg);
      border: 1.5px solid var(--card-border);
    }

    .base-card.fg-card {
      background: var(--fg);
      color: var(--bg);
    }

    /* ── Color palette grid ── */
    .palette-section { margin-bottom: 2.5rem; }

    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }

    .color-card {
      border-radius: 14px;
      overflow: hidden;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      box-shadow: 0 2px 12px var(--card-shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.4s ease;
    }

    .color-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px var(--card-shadow-hover);
    }

    .swatch {
      height: 110px;
      display: flex;
      align-items: flex-end;
      padding: 0.75rem 1rem;
    }

    .swatch span {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8rem;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .swatch.light-text span { color: #fff; background: rgba(255,255,255,0.14); }
    .swatch.dark-text span  { color: var(--fg); background: rgba(0,0,0,0.06); }

    .color-info { padding: 0.85rem 1rem; }
    .color-info .name { font-family: system-ui, sans-serif; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.15rem; }
    .color-info .desc { font-family: system-ui, sans-serif; font-size: 0.75rem; color: var(--muted); }

    /* ── Color view switcher ── */
    .colors-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .colors-header .section-title { margin-bottom: 0; }

    .view-tabs {
      display: flex;
      gap: 0.2rem;
      padding: 0.2rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 9px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .view-tabs::-webkit-scrollbar { display: none; }

    .view-tabs button {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.75rem;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.25s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .view-tabs button.active {
      background: var(--fg);
      color: var(--bg);
      box-shadow: 0 1px 3px var(--card-shadow);
    }

    .view-tabs button:not(.active):hover { color: var(--fg); }

    .color-view { display: none; }
    .color-view.active { display: block; }

    /* List view */
    .color-list-view {
      display: flex;
      flex-direction: column;
      gap: 0;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
    }

    .color-list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid var(--card-border);
      transition: background 0.15s ease;
    }

    .color-list-item:last-child { border-bottom: none; }
    .color-list-item:hover { background: var(--card-shadow); }

    .color-list-dot {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .color-list-name {
      font-family: system-ui, sans-serif;
      font-weight: 600;
      font-size: 0.82rem;
      min-width: 110px;
    }

    .color-list-hex {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8rem;
      color: var(--muted);
      min-width: 70px;
    }

    .color-list-desc {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      color: var(--muted);
      margin-left: auto;
    }

    /* Visual grid view */
    .color-visual-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0;
      border-radius: 14px;
      overflow: hidden;
    }

    .color-visual-cell {
      aspect-ratio: 1;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease;
      cursor: default;
    }

    .color-visual-cell:hover { opacity: 0.85; }

    .color-visual-cell span {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .color-visual-cell:hover span { opacity: 1; }
    .color-visual-cell.light-text span { color: #fff; background: rgba(255,255,255,0.2); }
    .color-visual-cell.dark-text span  { color: var(--fg); background: rgba(0,0,0,0.08); }

    /* ── Preview tabs ── */
    .preview-section { margin-bottom: 2.5rem; }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .preview-header .section-title { margin-bottom: 0; }

    .preview-tabs {
      display: flex;
      gap: 0.2rem;
      padding: 0.2rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 9px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .preview-tabs::-webkit-scrollbar { display: none; }

    .preview-tabs button {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.75rem;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.25s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .preview-tabs button.active {
      background: var(--fg);
      color: var(--bg);
      box-shadow: 0 1px 3px var(--card-shadow);
    }

    .preview-tabs button:not(.active):hover { color: var(--fg); }

    .preview-panel { display: none; }
    .preview-panel.active { display: block; }

    /* ── Terminal preview ── */
    .terminal-section { margin-bottom: 2.5rem; }

    .terminal {
      background: var(--terminal-bg);
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 4px 24px var(--card-shadow);
      transition: background 0.4s ease;
    }

    .terminal-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 0.75rem 1rem;
      background: var(--terminal-bar);
    }

    .terminal-dot { width: 12px; height: 12px; border-radius: 50%; }

    .terminal-body {
      padding: 1.25rem 1.5rem;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.85rem;
      line-height: 1.8;
      color: var(--terminal-fg);
    }

    .terminal-body .prompt { color: var(--green-bright); }
    .terminal-body .cmd    { color: var(--terminal-fg); }
    .terminal-body .str    { color: var(--yellow); }
    .terminal-body .kw     { color: var(--magenta-bright); }
    .terminal-body .fn     { color: var(--blue-bright); }
    .terminal-body .cmt    { color: var(--cyan); opacity: 0.7; }
    .terminal-body .err    { color: var(--red-bright); }
    .terminal-body .num    { color: var(--yellow-bright); }
    .terminal-body .type   { color: var(--cyan-bright); }

    /* ── Harmony strip ── */
    .harmony-section { margin-bottom: 2.5rem; }

    .harmony-strip {
      display: flex;
      border-radius: 14px;
      overflow: hidden;
      height: 64px;
      border: 1px solid var(--card-border);
    }

    .harmony-strip div { flex: 1; transition: flex 0.3s ease; }
    .harmony-strip div:hover { flex: 2; }

    /* ── Export section ── */
    .export-section { margin-bottom: 2.5rem; }

    .export-section .colors-header { margin-bottom: 1.25rem; }

    .colorlist {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem 1.75rem;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.82rem;
      line-height: 1.9;
      white-space: pre;
      overflow-x: auto;
      position: relative;
      transition: background 0.4s ease;
    }

    .colorlist .cl-comment { color: var(--muted); }
    .colorlist .cl-key     { color: var(--fg); }
    .colorlist .cl-value   { color: var(--magenta); font-weight: 600; }
    .colorlist .cl-desc    { color: var(--muted); }

    .copy-btn {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      font-family: inherit;
      font-size: 0.72rem;
      padding: 0.35rem 0.7rem;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--bg);
      color: var(--fg);
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.03em;
    }

    .copy-btn:hover { background: var(--fg); color: var(--bg); }

    /* ── Click-to-copy toast ── */
    .copy-toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(1rem);
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      background: var(--fg);
      color: var(--bg);
      box-shadow: 0 4px 16px var(--card-shadow);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      z-index: 200;
    }

    .copy-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    [data-key], .hex, .color-list-hex, .color-visual-cell {
      cursor: pointer;
    }

    /* ── Examples ── */
    .examples-section { margin-bottom: 2.5rem; }

    .examples-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .example-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.5rem;
      transition: background 0.4s ease;
    }

    .example-card h3 {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 1rem;
    }

    .btn-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .btn {
      font-family: system-ui, sans-serif;
      font-size: 0.78rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn:hover { opacity: 0.85; }
    .btn-primary   { background: var(--blue); color: #fff; }
    .btn-success   { background: var(--green); color: #fff; }
    .btn-danger    { background: var(--red); color: #fff; }
    .btn-warning   { background: var(--yellow); color: var(--fg); }
    .btn-outline   { background: transparent; border: 1.5px solid var(--fg); color: var(--fg); }

    .badge-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }

    .badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .input-stack { display: flex; flex-direction: column; gap: 0.6rem; }

    .input-field {
      font-family: inherit;
      font-size: 0.85rem;
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      border: 1.5px solid var(--card-border);
      background: var(--bg);
      color: var(--fg);
      outline: none;
      transition: border-color 0.2s;
    }

    .input-field:focus { border-color: var(--blue); }
    .input-field::placeholder { color: var(--muted); }

    .type-sample h4 {
      font-size: 1.4rem;
      font-weight: 300;
      margin-bottom: 0.5rem;
    }

    .type-sample p {
      font-size: 0.85rem;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 0.6rem;
    }

    .type-sample a {
      color: var(--blue);
      text-decoration: underline;
      text-decoration-color: var(--blue-bright);
      text-underline-offset: 2px;
    }

    .type-sample code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8rem;
      background: var(--bg);
      padding: 0.15rem 0.45rem;
      border-radius: 5px;
      border: 1px solid var(--card-border);
    }

    .status-list { display: flex; flex-direction: column; gap: 0.6rem; }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.85rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-item .status-label { color: var(--muted); margin-left: auto; font-size: 0.75rem; }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    /* ── Poster/Banner ── */
    .poster-section { margin-bottom: 2.5rem; }

    .poster {
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      position: relative;
      transition: background 0.4s ease;
    }

    .poster-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, var(--red-bright), transparent 50%),
        radial-gradient(ellipse at 80% 30%, var(--blue-bright), transparent 50%),
        radial-gradient(ellipse at 50% 90%, var(--cyan-bright), transparent 50%),
        var(--bg);
      opacity: 0.3;
      transition: opacity 0.4s ease;
    }

    .poster-inner {
      position: relative;
      padding: 3.5rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      min-height: 480px;
      justify-content: center;
    }

    .poster-title {
      font-family: 'Georgia', serif;
      font-size: 6rem;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-align: center;
      line-height: 1;
    }

    .poster-romanji {
      font-family: system-ui, sans-serif;
      font-size: 0.82rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      text-align: center;
      margin-top: -0.5rem;
    }

    .poster-palette {
      display: flex;
      gap: 0;
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 4px 20px var(--card-shadow);
    }

    .poster-swatch {
      width: 36px;
      height: 36px;
      transition: transform 0.3s ease, width 0.3s ease;
    }

    .poster-swatch:hover { transform: scaleY(1.3); }

    .poster-divider {
      width: 60px;
      height: 1px;
      background: var(--card-border);
      margin: 0.5rem 0;
    }

    .poster-tagline {
      font-family: 'Georgia', serif;
      font-size: 1.05rem;
      color: var(--muted);
      text-align: center;
      font-style: italic;
      letter-spacing: 0.03em;
      max-width: 320px;
      line-height: 1.6;
    }

    .poster-meta {
      font-family: system-ui, sans-serif;
      font-size: 0.62rem;
      color: var(--muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.6;
    }

    /* ── Syntax preview ── */
    .syntax-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .syntax-block {
      background: var(--terminal-bg);
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 4px 24px var(--card-shadow);
    }

    .syntax-label {
      font-family: system-ui, sans-serif;
      font-size: 0.62rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--terminal-fg);
      opacity: 0.35;
      padding: 0.75rem 1.25rem 0;
    }

    .syntax-body {
      padding: 0.75rem 1.25rem 1.25rem;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.78rem;
      line-height: 1.75;
      color: var(--terminal-fg);
    }

    .syntax-body .s-kw     { color: var(--magenta-bright); }
    .syntax-body .s-fn     { color: var(--blue-bright); }
    .syntax-body .s-str    { color: var(--yellow); }
    .syntax-body .s-cmt    { color: var(--cyan); opacity: 0.65; }
    .syntax-body .s-type   { color: var(--cyan-bright); }
    .syntax-body .s-num    { color: var(--yellow-bright); }
    .syntax-body .s-var    { color: var(--red-bright); }
    .syntax-body .s-op     { color: var(--fg); opacity: 0.5; }
    .syntax-body .s-tag    { color: var(--red); }
    .syntax-body .s-attr   { color: var(--yellow); }
    .syntax-body .s-val    { color: var(--green); }

    /* ── Footer ── */
    footer {
      max-width: 720px;
      margin: 0 auto;
      text-align: left;
      padding: 2rem 2rem 2.5rem;
      border-top: 1px solid var(--card-border);
    }

    footer p {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      color: var(--muted);
      line-height: 1.8;
    }

    footer a {
      color: var(--fg);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
      border-bottom: 1px solid var(--card-border);
    }

    footer a:hover { color: var(--magenta); }

    footer .footer-dot {
      display: inline-block;
      margin: 0 0.4rem;
      opacity: 0.35;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .container { padding: 3.5rem 1rem 1.5rem; }
      .section-divider { margin: 1.75rem 0 1.25rem; }
      .section-title { font-size: 0.62rem; margin-bottom: 0.75rem; }
      header { margin-bottom: 1.25rem; padding-bottom: 1.25rem; }
      header h1 { font-size: 2.4rem; }
      header .romanji { font-size: 0.78rem; margin-bottom: 0.4rem; }
      header .subtitle { font-size: 0.92rem; }
      .intro { font-size: 0.9rem; line-height: 1.7; margin-bottom: 0.35rem; }
      .intro-sig { margin-bottom: 1.75rem; font-size: 0.8rem; }
      .theme-toggle { top: 0.6rem; right: 0.6rem; padding: 0.2rem; border-radius: 8px; }
      .theme-toggle button { font-size: 0.65rem; padding: 0.28rem 0.55rem; border-radius: 6px; }
      .base-row { grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.5rem; }
      .base-card { min-height: 90px; padding: 1.25rem 1rem; border-radius: 12px; }
      .base-card .label { font-size: 0.82rem; }
      .base-card .hex { font-size: 0.72rem; }
      .palette-section { margin-bottom: 1.5rem; }
      .colors-header { margin-bottom: 0.75rem; }
      .palette-grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
      .swatch { height: 72px; padding: 0.5rem 0.75rem; }
      .swatch span { font-size: 0.68rem; }
      .color-card { border-radius: 10px; }
      .color-info { padding: 0.6rem 0.75rem; }
      .color-info .name { font-size: 0.78rem; }
      .color-info .desc { font-size: 0.68rem; }
      .view-tabs { padding: 0.15rem; border-radius: 7px; }
      .view-tabs button { font-size: 0.58rem; padding: 0.28rem 0.55rem; border-radius: 5px; letter-spacing: 0.05em; }
      .color-list-view { border-radius: 10px; }
      .color-list-item { padding: 0.5rem 0.75rem; gap: 0.65rem; }
      .color-list-dot { width: 22px; height: 22px; border-radius: 6px; }
      .color-list-name { font-size: 0.75rem; min-width: 85px; }
      .color-list-hex { font-size: 0.7rem; }
      .color-list-desc { display: none; }
      .color-visual-grid { grid-template-columns: repeat(4, 1fr); border-radius: 10px; }
      .color-visual-cell span { font-size: 0.6rem; }
      .preview-section { margin-bottom: 1.5rem; }
      .preview-header { margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
      .preview-tabs { padding: 0.15rem; border-radius: 7px; }
      .preview-tabs button { font-size: 0.58rem; padding: 0.28rem 0.55rem; border-radius: 5px; }
      .terminal { border-radius: 10px; }
      .terminal-bar { padding: 0.5rem 0.75rem; gap: 5px; }
      .terminal-dot { width: 9px; height: 9px; }
      .terminal-body { padding: 0.85rem 1rem; font-size: 0.72rem; line-height: 1.65; }
      .examples-grid { grid-template-columns: 1fr; gap: 0.6rem; }
      .example-card { padding: 1rem; border-radius: 10px; }
      .example-card h3 { font-size: 0.62rem; margin-bottom: 0.6rem; }
      .btn { font-size: 0.72rem; padding: 0.4rem 0.75rem; }
      .badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
      .input-field { font-size: 0.78rem; padding: 0.45rem 0.7rem; }
      .alert { padding: 0.55rem 0.75rem; font-size: 0.75rem; border-radius: 6px; margin-bottom: 0.35rem; }
      .poster { border-radius: 10px; }
      .poster-inner { padding: 2rem 1.25rem; gap: 1rem; min-height: 320px; }
      .poster-title { font-size: 3rem; }
      .poster-romanji { font-size: 0.7rem; }
      .poster-swatch { width: 26px; height: 26px; }
      .poster-tagline { font-size: 0.85rem; }
      .syntax-preview { grid-template-columns: 1fr; gap: 0.6rem; }
      .syntax-block { border-radius: 10px; }
      .syntax-label { font-size: 0.58rem; padding: 0.6rem 1rem 0; }
      .syntax-body { padding: 0.5rem 1rem 1rem; font-size: 0.68rem; line-height: 1.6; }
      .harmony-strip { height: 44px; border-radius: 10px; }
      .export-section { margin-bottom: 1.5rem; }
      .export-section .colors-header { margin-bottom: 0.75rem; }
      .colorlist { padding: 1rem 1rem; font-size: 0.68rem; line-height: 1.7; border-radius: 10px; }
      .copy-btn { font-size: 0.65rem; padding: 0.25rem 0.55rem; top: 0.6rem; right: 0.6rem; border-radius: 6px; }
      footer { padding: 1.25rem 1rem 1.5rem; }
      footer p { font-size: 0.68rem; }
    }

    /* ── Mobile select for export tabs ── */
    .mobile-select {
      display: none;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.4rem 0.6rem;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--fg);
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%232a2520' opacity='0.4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.6rem center;
      padding-right: 1.8rem;
    }

    [data-theme="dark"] .mobile-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23d5d0c8' opacity='0.4'/%3E%3C/svg%3E");
    }

    @media (max-width: 600px) {
      .export-section .mobile-select { display: block; }
      .export-section .view-tabs { display: none !important; }
    }

    .toc {
      position: fixed;
      bottom: 0;
      top: 0;
      left: 2rem;
      z-index: 90;
      display: none;
      align-items: center;
      pointer-events: none;
    }

    .toc ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      pointer-events: auto;
    }

    .toc a {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.68rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .toc a::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 1px;
      background: var(--card-border);
      transition: width 0.2s ease, background 0.2s ease;
    }

    .toc a:hover { color: var(--fg); }
    .toc a:hover::before { width: 16px; background: var(--fg); }

    .toc a.active { color: var(--fg); }
    .toc a.active::before { width: 16px; background: var(--fg); }

    @media (min-width: 1100px) {
      .toc { display: flex; }
    }

    /* ── Origin badge ── */
    .origin-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: system-ui, sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      padding: 0.3rem 0.7rem;
      border-radius: 20px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--muted);
      margin-bottom: 1rem;
    }

    .origin-badge span { font-size: 0.85rem; }
  </style>
</head>
<body>
  <!-- Theme toggle -->
  <div class="theme-toggle" role="tablist" aria-label="Theme">
    <button role="tab" aria-selected="false" onclick="setTheme('light')">☀ Day</button>
    <button class="active" role="tab" aria-selected="true" onclick="setTheme('dark')">☾ Night</button>
  </div>

  <!-- Table of contents -->
  <nav class="toc" aria-label="Page sections">
    <ul>
      <li><a href="#sec-about">About</a></li>
      <li><a href="#sec-colors">Colors</a></li>
      <li><a href="#sec-previews">Previews</a></li>
      <li><a href="#sec-export">Export</a></li>
    </ul>
  </nav>

  <div class="container">
    <header id="sec-about">
      <div class="origin-badge"><span>📷</span> Extracted from photographs</div>
      <h1 id="theme-title">Sarela</h1>
      <p class="romanji">sarela <span style="opacity: 0.5;">/saˈɾela/</span></p>
      <p class="subtitle" id="theme-subtitle">Warm earth tones meet vivid accents — colors born from real photographs</p>
    </header>

    <p class="intro">
      this palette was extracted from a collection of photographs using rampa's palette engine — k-means++ clustering on 50,000 sampled pixels per image, pooling ANSI-classified colors across 7 diverse shots. the result is a set of hues that feel grounded and natural because they literally come from nature. every color earned its place through frequency, chroma, and perceptual balance.
    </p>
    <p class="intro-sig">– built with <a href="https://github.com/basiclines/rampa-studio" target="_blank" rel="noopener">rampa</a></p>

    <hr class="section-divider">

    <!-- Base colors -->
    <p class="section-title" id="sec-base">Background &amp; Foreground</p>
    <div class="base-row">
      <div class="base-card bg-card">
        <span class="label">Background</span>
        <span class="hex" id="hex-bg">#1a1714</span>
      </div>
      <div class="base-card fg-card">
        <span class="label">Foreground</span>
        <span class="hex" id="hex-fg">#d5d0c8</span>
      </div>
    </div>

    <hr class="section-divider">

    <!-- Colors -->
    <div class="palette-section">
      <div class="colors-header">
        <p class="section-title" id="sec-colors">Colors</p>
        <div class="view-tabs" role="tablist" aria-label="Color display">
          <button class="active" role="tab" aria-selected="true" onclick="setColorView('cards')">Cards</button>
          <button role="tab" aria-selected="false" onclick="setColorView('list')">List</button>
          <button role="tab" aria-selected="false" onclick="setColorView('grid')">Grid</button>
        </div>
      </div>

      <!-- Cards view -->
      <div class="color-view active" id="view-cards">
        <p class="section-title" style="margin-top: 0.5rem;">Standard</p>
        <div class="palette-grid" id="standard-grid">
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--red)"><span data-key="red"></span></div>
            <div class="color-info"><div class="name">Red</div><div class="desc">Vivid crimson</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--green)"><span data-key="green"></span></div>
            <div class="color-info"><div class="name">Green</div><div class="desc">Forest green</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--blue)"><span data-key="blue"></span></div>
            <div class="color-info"><div class="name">Blue</div><div class="desc">Deep cobalt</div></div>
          </div>
          <div class="color-card">
            <div class="swatch dark-text" style="background: var(--yellow)"><span data-key="yellow"></span></div>
            <div class="color-info"><div class="name">Yellow</div><div class="desc">Olive gold</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--magenta)"><span data-key="magenta"></span></div>
            <div class="color-info"><div class="name">Magenta</div><div class="desc">Warm orchid</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--cyan)"><span data-key="cyan"></span></div>
            <div class="color-info"><div class="name">Cyan</div><div class="desc">Deep teal</div></div>
          </div>
        </div>
        <p class="section-title" style="margin-top: 1.5rem;">Bright</p>
        <div class="palette-grid" id="bright-grid">
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--red-bright)"><span data-key="red_bright"></span></div>
            <div class="color-info"><div class="name">Bright Red</div><div class="desc">Coral flame</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--green-bright)"><span data-key="green_bright"></span></div>
            <div class="color-info"><div class="name">Bright Green</div><div class="desc">Spring leaf</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--blue-bright)"><span data-key="blue_bright"></span></div>
            <div class="color-info"><div class="name">Bright Blue</div><div class="desc">Sky blue</div></div>
          </div>
          <div class="color-card">
            <div class="swatch dark-text" style="background: var(--yellow-bright)"><span data-key="yellow_bright"></span></div>
            <div class="color-info"><div class="name">Bright Yellow</div><div class="desc">Lemon grass</div></div>
          </div>
          <div class="color-card">
            <div class="swatch dark-text" style="background: var(--magenta-bright)"><span data-key="magenta_bright"></span></div>
            <div class="color-info"><div class="name">Bright Magenta</div><div class="desc">Pink lavender</div></div>
          </div>
          <div class="color-card">
            <div class="swatch light-text" style="background: var(--cyan-bright)"><span data-key="cyan_bright"></span></div>
            <div class="color-info"><div class="name">Bright Cyan</div><div class="desc">Seafoam</div></div>
          </div>
        </div>
      </div>

      <!-- List view -->
      <div class="color-view" id="view-list">
        <div class="color-list-view" id="color-list-view"></div>
      </div>

      <!-- Grid view -->
      <div class="color-view" id="view-grid">
        <div class="color-visual-grid" id="color-visual-grid"></div>
      </div>
    </div>

    <hr class="section-divider">

    <!-- Harmony strip -->
    <div class="harmony-section">
      <p class="section-title">Harmony</p>
      <div class="harmony-strip">
        <div style="background: var(--red)"></div>
        <div style="background: var(--red-bright)"></div>
        <div style="background: var(--yellow)"></div>
        <div style="background: var(--yellow-bright)"></div>
        <div style="background: var(--green)"></div>
        <div style="background: var(--green-bright)"></div>
        <div style="background: var(--cyan)"></div>
        <div style="background: var(--cyan-bright)"></div>
        <div style="background: var(--blue)"></div>
        <div style="background: var(--blue-bright)"></div>
        <div style="background: var(--magenta)"></div>
        <div style="background: var(--magenta-bright)"></div>
      </div>
    </div>

    <hr class="section-divider">

    <!-- Previews -->
    <div class="preview-section" id="sec-previews">
      <div class="preview-header">
        <p class="section-title">Previews</p>
        <div class="preview-tabs" role="tablist" aria-label="Preview type">
          <button class="active" role="tab" aria-selected="true" onclick="setPreview('terminal')">Terminal</button>
          <button role="tab" aria-selected="false" onclick="setPreview('syntax')">Syntax</button>
          <button role="tab" aria-selected="false" onclick="setPreview('ui')">UI</button>
          <button role="tab" aria-selected="false" onclick="setPreview('banner')">Banner</button>
        </div>
      </div>

      <!-- Terminal preview -->
      <div class="preview-panel active" id="preview-terminal">
        <div class="terminal">
          <div class="terminal-bar">
            <div class="terminal-dot" style="background: var(--red)"></div>
            <div class="terminal-dot" style="background: var(--yellow)"></div>
            <div class="terminal-dot" style="background: var(--green)"></div>
          </div>
          <div class="terminal-body">
            <div><span class="cmt" id="terminal-comment"># Sarela Night</span></div>
            <div><span class="prompt">❯</span> <span class="cmd">cat</span> <span class="str">palette.ts</span></div>
            <div>&nbsp;</div>
            <div><span class="kw">import</span> { <span class="type">palette</span>, <span class="type">color</span> } <span class="kw">from</span> <span class="str">"@basiclines/rampa-sdk"</span></div>
            <div>&nbsp;</div>
            <div><span class="kw">const</span> <span class="fn">colors</span> <span class="cmd">= </span><span class="fn">palette</span><span class="cmd">(</span><span class="str">"photo.jpg"</span><span class="cmd">)</span></div>
            <div><span class="cmd">&nbsp;&nbsp;.</span><span class="fn">ansi</span><span class="cmd">({ </span><span class="type">count</span><span class="cmd">: </span><span class="num">15</span><span class="cmd"> })</span></div>
            <div><span class="cmd">&nbsp;&nbsp;.</span><span class="fn">sortBy</span><span class="cmd">(</span><span class="str">"L"</span><span class="cmd">)</span></div>
            <div>&nbsp;</div>
            <div><span class="kw">for</span> <span class="cmd">(</span><span class="kw">const</span> <span class="cmd">c </span><span class="kw">of</span> <span class="cmd">colors) {</span></div>
            <div><span class="cmd">&nbsp;&nbsp;</span><span class="fn">console</span><span class="cmd">.</span><span class="fn">log</span><span class="cmd">(</span><span class="fn">color</span><span class="cmd">(c.hex).</span><span class="type">oklch</span><span class="cmd">)</span></div>
            <div><span class="cmd">}</span></div>
            <div><span class="cmt"># → { l: 0.58, c: 0.218, h: 18 }</span></div>
          </div>
        </div>
      </div>

      <!-- Syntax preview -->
      <div class="preview-panel" id="preview-syntax">
        <div class="syntax-preview">
          <div class="syntax-block">
            <div class="syntax-label">JavaScript</div>
            <div class="syntax-body">
<span class="s-kw">const</span> <span class="s-var">theme</span> <span class="s-op">=</span> {
  <span class="s-attr">name</span><span class="s-op">:</span> <span class="s-str">'Sarela Night'</span>,
  <span class="s-attr">colors</span><span class="s-op">:</span> <span class="s-num">16</span>,
};

<span class="s-kw">function</span> <span class="s-fn">applyTheme</span>(el) {
  <span class="s-kw">const</span> <span class="s-var">bg</span> <span class="s-op">=</span> <span class="s-fn">getColor</span>(<span class="s-str">'bg'</span>);
  el.style.background <span class="s-op">=</span> <span class="s-var">bg</span>;
  <span class="s-kw">return</span> <span class="s-var">theme</span>;
}
            </div>
          </div>
          <div class="syntax-block">
            <div class="syntax-label">HTML / CSS</div>
            <div class="syntax-body">
<span class="s-tag">&lt;div</span> <span class="s-attr">class</span><span class="s-op">=</span><span class="s-str">"sarela"</span><span class="s-tag">&gt;</span>
  <span class="s-tag">&lt;h1&gt;</span>Sarela<span class="s-tag">&lt;/h1&gt;</span>
<span class="s-tag">&lt;/div&gt;</span>

<span class="s-tag">&lt;style&gt;</span>
<span class="s-fn">.sarela</span> {
  <span class="s-attr">background</span><span class="s-op">:</span> <span class="s-val">#1a1714</span>;
  <span class="s-attr">color</span><span class="s-op">:</span> <span class="s-val">#d5d0c8</span>;
  <span class="s-attr">font-family</span><span class="s-op">:</span> <span class="s-str">Georgia</span>;
}
<span class="s-tag">&lt;/style&gt;</span>
            </div>
          </div>
          <div class="syntax-block">
            <div class="syntax-label">Python</div>
            <div class="syntax-body">
<span class="s-kw">from</span> <span class="s-type">dataclasses</span> <span class="s-kw">import</span> <span class="s-type">dataclass</span>

<span class="s-cmt"># colors from photographs</span>
<span class="s-op">@</span><span class="s-type">dataclass</span>
<span class="s-kw">class</span> <span class="s-type">Theme</span>:
    <span class="s-var">name</span>: <span class="s-type">str</span> <span class="s-op">=</span> <span class="s-str">"Sarela"</span>
    <span class="s-var">bg</span>: <span class="s-type">str</span> <span class="s-op">=</span> <span class="s-str">"#1a1714"</span>
    <span class="s-var">fg</span>: <span class="s-type">str</span> <span class="s-op">=</span> <span class="s-str">"#d5d0c8"</span>
            </div>
          </div>
          <div class="syntax-block">
            <div class="syntax-label">Rust</div>
            <div class="syntax-body">
<span class="s-kw">use</span> <span class="s-type">serde</span>::{<span class="s-type">Deserialize</span>};

<span class="s-cmt">// photo-derived palette</span>
<span class="s-op">#[</span><span class="s-fn">derive</span>(<span class="s-type">Deserialize</span>)<span class="s-op">]</span>
<span class="s-kw">struct</span> <span class="s-type">Palette</span> {
    <span class="s-var">bg</span>: <span class="s-type">String</span>,
    <span class="s-var">fg</span>: <span class="s-type">String</span>,
    <span class="s-var">colors</span>: <span class="s-type">Vec</span><span class="s-op">&lt;</span><span class="s-type">Color</span><span class="s-op">&gt;</span>,
}
            </div>
          </div>
        </div>
      </div>

      <!-- UI preview -->
      <div class="preview-panel" id="preview-ui">
        <div class="examples-grid">
          <div class="example-card">
            <h3>Buttons</h3>
            <div class="btn-row">
              <button class="btn btn-primary">Primary</button>
              <button class="btn btn-success">Success</button>
              <button class="btn btn-danger">Danger</button>
              <button class="btn btn-warning">Warning</button>
              <button class="btn btn-outline">Outline</button>
            </div>
          </div>

          <div class="example-card">
            <h3>Badges &amp; Tags</h3>
            <div class="badge-row">
              <span class="badge" style="background: var(--green); color: #fff;">Stable</span>
              <span class="badge" style="background: var(--yellow); color: var(--fg);">Beta</span>
              <span class="badge" style="background: var(--red); color: #fff;">Deprecated</span>
              <span class="badge" style="background: var(--blue); color: #fff;">New</span>
              <span class="badge" style="background: var(--magenta); color: #fff;">Theme</span>
              <span class="badge" style="background: var(--cyan); color: #fff;">v1.0</span>
            </div>
          </div>

          <div class="example-card">
            <h3>Form Inputs</h3>
            <div class="input-stack">
              <input class="input-field" type="text" placeholder="Enter a color name…">
              <input class="input-field" type="text" placeholder="#1a1714" value="#1a1714">
            </div>
          </div>

          <div class="example-card">
            <h3>Typography</h3>
            <div class="type-sample">
              <h4>Heading in Sarela</h4>
              <p>Body text with <a href="#">a link</a> and some <code>inline code</code> to show how the palette works in real content.</p>
            </div>
          </div>

          <div class="example-card">
            <h3>Alerts</h3>
            <div class="alert" style="background: rgba(90,138,51,0.15); color: var(--green);">
              ✓ Theme applied successfully
            </div>
            <div class="alert" style="background: rgba(221,31,70,0.15); color: var(--red);">
              ✕ Invalid hex value
            </div>
            <div class="alert" style="background: rgba(58,114,201,0.15); color: var(--blue);">
              ℹ 16 colors available
            </div>
          </div>

          <div class="example-card">
            <h3>Status</h3>
            <div class="status-list">
              <div class="status-item">
                <div class="status-dot" style="background: var(--green);"></div>
                Terminal <span class="status-label">Active</span>
              </div>
              <div class="status-item">
                <div class="status-dot" style="background: var(--yellow);"></div>
                Editor <span class="status-label">Loading</span>
              </div>
              <div class="status-item">
                <div class="status-dot" style="background: var(--red);"></div>
                Linter <span class="status-label">Error</span>
              </div>
              <div class="status-item">
                <div class="status-dot" style="background: var(--blue);"></div>
                Git sync <span class="status-label">Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner preview -->
      <div class="preview-panel" id="preview-banner">
        <div class="poster">
          <div class="poster-bg"></div>
          <div class="poster-inner">
            <div class="poster-meta">Color theme · 16 colors · Night & Day</div>
            <div class="poster-title">Sarela</div>
            <div class="poster-romanji">photo-derived palette</div>
            <div class="poster-palette">
              <div class="poster-swatch" style="background: var(--red)"></div>
              <div class="poster-swatch" style="background: var(--red-bright)"></div>
              <div class="poster-swatch" style="background: var(--yellow)"></div>
              <div class="poster-swatch" style="background: var(--yellow-bright)"></div>
              <div class="poster-swatch" style="background: var(--green)"></div>
              <div class="poster-swatch" style="background: var(--green-bright)"></div>
              <div class="poster-swatch" style="background: var(--cyan)"></div>
              <div class="poster-swatch" style="background: var(--cyan-bright)"></div>
              <div class="poster-swatch" style="background: var(--blue)"></div>
              <div class="poster-swatch" style="background: var(--blue-bright)"></div>
              <div class="poster-swatch" style="background: var(--magenta)"></div>
              <div class="poster-swatch" style="background: var(--magenta-bright)"></div>
            </div>
            <div class="poster-divider"></div>
            <div class="poster-tagline">"warm earth tones meet vivid accents — colors born from real photographs"</div>
            <div class="poster-meta">built with rampa by @basiclines</div>
          </div>
        </div>
      </div>
    </div>

    <hr class="section-divider">

    <!-- Export -->
    <div class="export-section" id="sec-export">
      <div class="colors-header">
        <p class="section-title">Export</p>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="view-tabs export-theme-tabs" role="tablist" aria-label="Export theme">
            <button role="tab" aria-selected="false" onclick="setExportTheme('light')">☀ Day</button>
            <button class="active" role="tab" aria-selected="true" onclick="setExportTheme('dark')">☾ Night</button>
          </div>
          <select class="mobile-select" aria-label="Export format" onchange="setExport(this.value)">
            <option value="ghostty">Ghostty</option>
            <option value="raw">Raw</option>
            <option value="css">CSS</option>
            <option value="alacritty">Alacritty</option>
            <option value="vscode">VS Code</option>
            <option value="wt">Win Terminal</option>
            <option value="iterm">iTerm2</option>
          </select>
          <div class="view-tabs export-format-tabs" role="tablist" aria-label="Export format">
            <button class="active" role="tab" aria-selected="true" onclick="setExport('ghostty')">Ghostty</button>
            <button role="tab" aria-selected="false" onclick="setExport('raw')">Raw</button>
            <button role="tab" aria-selected="false" onclick="setExport('css')">CSS</button>
            <button role="tab" aria-selected="false" onclick="setExport('alacritty')">Alacritty</button>
            <button role="tab" aria-selected="false" onclick="setExport('vscode')">VS Code</button>
            <button role="tab" aria-selected="false" onclick="setExport('wt')">Win Terminal</button>
            <button role="tab" aria-selected="false" onclick="setExport('iterm')">iTerm2</button>
          </div>
        </div>
      </div>
      <div class="colorlist" id="export-block">
        <button class="copy-btn" onclick="copyExport()">Copy</button>
      </div>
    </div>
  </div>
  <footer>
    <p>
      Built with <a href="https://github.com/basiclines/rampa-studio" target="_blank" rel="noopener">rampa</a> by <a href="https://github.com/basiclines" target="_blank" rel="noopener">@basiclines</a>
      <span class="footer-dot">·</span>
      Colors extracted from photographs using k-means++ clustering
    </p>
  </footer>

  <div class="copy-toast" id="copy-toast">Copied!</div>

  <script>
    const themes = {
      dark: {
        name: 'Sarela',
        variant: 'Night',
        subtitle: 'Warm earth tones meet vivid accents — colors born from real photographs',
        terminalComment: '# Sarela Night',
        bg: '#1a1714', fg: '#d5d0c8',
        black: '#1a1714', white: '#d5d0c8',
        black_bright: '#45403a', white_bright: '#f5f2ed',
        colors: {
          red: '#dd1f46', green: '#5a8a33', blue: '#3a72c9',
          yellow: '#adab2e', magenta: '#c27db8', cyan: '#169483',
          red_bright: '#fb5668', green_bright: '#7aa859', blue_bright: '#5c92e5',
          yellow_bright: '#cccb5f', magenta_bright: '#e09fd5', cyan_bright: '#52b1a1'
        },
        descs: {
          bg: 'Warm charcoal', fg: 'Soft cream',
          red: 'Vivid crimson', green: 'Forest green', blue: 'Deep cobalt',
          yellow: 'Olive gold', magenta: 'Warm orchid', cyan: 'Deep teal',
          red_bright: 'Coral flame', green_bright: 'Spring leaf', blue_bright: 'Sky blue',
          yellow_bright: 'Lemon grass', magenta_bright: 'Pink lavender', cyan_bright: 'Seafoam'
        }
      },
      light: {
        name: 'Sarela',
        variant: 'Day',
        subtitle: 'Natural hues darkened for daylight — grounded, warm, readable',
        terminalComment: '# Sarela Day',
        bg: '#f5f2ed', fg: '#2a2520',
        black: '#d5d0c8', white: '#2a2520',
        black_bright: '#b0a99e', white_bright: '#1a1714',
        colors: {
          red: '#b90235', green: '#437217', blue: '#225aaf',
          yellow: '#949204', magenta: '#a8659f', cyan: '#017a6b',
          red_bright: '#d61140', green_bright: '#54842c', blue_bright: '#346cc2',
          yellow_bright: '#a7a525', magenta_bright: '#bb77b2', cyan_bright: '#048e7d'
        },
        descs: {
          bg: 'Warm paper', fg: 'Espresso brown',
          red: 'Deep crimson', green: 'Dark forest', blue: 'Navy blue',
          yellow: 'Dark olive', magenta: 'Dusty plum', cyan: 'Dark teal',
          red_bright: 'Berry red', green_bright: 'Moss green', blue_bright: 'Royal blue',
          yellow_bright: 'Autumn gold', magenta_bright: 'Mauve rose', cyan_bright: 'Jade'
        }
      }
    };

    let currentExportTheme = 'dark';

    function setTheme(mode) {
      document.documentElement.setAttribute('data-theme', mode);
      const t = themes[mode];

      document.getElementById('theme-title').textContent = t.name;
      document.getElementById('theme-subtitle').textContent = t.subtitle;
      document.getElementById('terminal-comment').textContent = t.terminalComment;

      document.getElementById('hex-bg').textContent = t.bg;
      document.getElementById('hex-fg').textContent = t.fg;

      document.querySelectorAll('[data-key]').forEach(el => {
        el.textContent = t.colors[el.dataset.key];
      });

      document.querySelectorAll('.theme-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(mode === 'light' ? 'Day' : 'Night'));
        btn.setAttribute('aria-selected', btn.classList.contains('active'));
      });

      currentExportTheme = mode;
      document.querySelectorAll('.export-theme-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(mode === 'light' ? 'Day' : 'Night'));
      });

      renderExport();
      renderColorViews();
    }

    function setExportTheme(mode) {
      currentExportTheme = mode;
      document.querySelectorAll('.export-theme-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(mode === 'light' ? 'Day' : 'Night'));
      });
      renderExport();
    }

    let currentExport = 'ghostty';

    function setExport(fmt) {
      currentExport = fmt;
      const fmtMap = {
        ghostty: 'Ghostty', raw: 'Raw', css: 'CSS',
        alacritty: 'Alacritty', vscode: 'VS Code',
        wt: 'Win Terminal', iterm: 'iTerm2'
      };
      document.querySelectorAll('.export-format-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === fmtMap[fmt]);
      });
      const sel = document.querySelector('.export-section .mobile-select');
      if (sel) sel.value = fmt;
      renderExport();
    }

    function renderExport() {
      const t = themes[currentExportTheme];
      const c = t.colors;
      const d = t.descs;
      const title = \`Sarela \${t.variant}\`;
      let out = '';

      const h = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const cl = (k, v) => \`<span class="cl-key">\${k}</span> <span class="cl-value">\${v}</span>\`;
      const cmt = (s) => \`<span class="cl-comment">\${s}</span>\`;

      if (currentExport === 'ghostty') {
        out = [
          cmt(\`# \${title}\`),
          cmt('# Generated from photographs using rampa palette'), '',
          cl('background =', t.bg),
          cl('foreground =', t.fg), '',
          cl('palette = 0=', t.black),
          cl('palette = 1=', c.red),
          cl('palette = 2=', c.green),
          cl('palette = 3=', c.yellow),
          cl('palette = 4=', c.blue),
          cl('palette = 5=', c.magenta),
          cl('palette = 6=', c.cyan),
          cl('palette = 7=', t.white), '',
          cl('palette = 8=', t.black_bright),
          cl('palette = 9=', c.red_bright),
          cl('palette = 10=', c.green_bright),
          cl('palette = 11=', c.yellow_bright),
          cl('palette = 12=', c.blue_bright),
          cl('palette = 13=', c.magenta_bright),
          cl('palette = 14=', c.cyan_bright),
          cl('palette = 15=', t.white_bright),
        ].join('\\n');
      }

      else if (currentExport === 'raw') {
        out = [
          cmt(\`# \${title}\`), '',
          cmt('# Background and foreground'),
          \`\${cl('bg:', t.bg)} <span class="cl-desc"># \${d.bg}</span>\`,
          \`\${cl('fg:', t.fg)} <span class="cl-desc"># \${d.fg}</span>\`, '',
          cmt('# Standard colors'),
          ...['red','green','blue','yellow','magenta','cyan'].map(k =>
            \`\${cl(k + ':', c[k])} <span class="cl-desc"># \${d[k]}</span>\`), '',
          cmt('# Bright colors'),
          ...['red_bright','green_bright','blue_bright','yellow_bright','magenta_bright','cyan_bright'].map(k =>
            \`\${cl(k + ':', c[k])} <span class="cl-desc"># \${d[k]}</span>\`)
        ].join('\\n');
      }

      else if (currentExport === 'css') {
        out = [
          cmt(\`/* \${title} */\`),
          \`<span class="cl-key">:root</span> {\`,
          \`  \${cl('--bg:', t.bg + ';')}\`,
          \`  \${cl('--fg:', t.fg + ';')}\`,
          ...Object.entries(c).map(([k,v]) =>
            \`  \${cl('--' + k.replace(/_/g,'-') + ':', v + ';')}\`),
          \`}\`
        ].join('\\n');
      }

      else if (currentExport === 'vscode') {
        const j = {
          "name": title,
          "type": currentExportTheme,
          "colors": {
            "editor.background": t.bg,
            "editor.foreground": t.fg,
            "terminal.ansiBlack": t.black,
            "terminal.ansiRed": c.red,
            "terminal.ansiGreen": c.green,
            "terminal.ansiYellow": c.yellow,
            "terminal.ansiBlue": c.blue,
            "terminal.ansiMagenta": c.magenta,
            "terminal.ansiCyan": c.cyan,
            "terminal.ansiWhite": t.white,
            "terminal.ansiBrightBlack": t.black_bright,
            "terminal.ansiBrightRed": c.red_bright,
            "terminal.ansiBrightGreen": c.green_bright,
            "terminal.ansiBrightYellow": c.yellow_bright,
            "terminal.ansiBrightBlue": c.blue_bright,
            "terminal.ansiBrightMagenta": c.magenta_bright,
            "terminal.ansiBrightCyan": c.cyan_bright,
            "terminal.ansiBrightWhite": t.white_bright
          }
        };
        out = cmt('// VS Code color theme (settings.json)') + '\\n' +
          h(JSON.stringify(j, null, 2));
      }

      else if (currentExport === 'iterm') {
        const rgb = (hex) => {
          const r = parseInt(hex.slice(1,3),16)/255;
          const g = parseInt(hex.slice(3,5),16)/255;
          const b = parseInt(hex.slice(5,7),16)/255;
          return \`\${r.toFixed(6)} \${g.toFixed(6)} \${b.toFixed(6)}\`;
        };
        const entry = (name, hex) => {
          const [r,g,b] = rgb(hex).split(' ');
          return \`\${h('<key>')}\${name}\${h('</key>')}\\n\${h('<dict>')}\\n  \${h('<key>')}Red Component\${h('</key>')}\\n  \${h('<real>')}\${r}\${h('</real>')}\\n  \${h('<key>')}Green Component\${h('</key>')}\\n  \${h('<real>')}\${g}\${h('</real>')}\\n  \${h('<key>')}Blue Component\${h('</key>')}\\n  \${h('<real>')}\${b}\${h('</real>')}\\n\${h('</dict>')}\`;
        };
        out = [
          cmt(\`&lt;!-- \${title} — iTerm2 Color Preset --&gt;\`),
          entry('Background Color', t.bg),
          entry('Foreground Color', t.fg),
          entry('Ansi 0 Color', t.black),
          entry('Ansi 1 Color', c.red),
          entry('Ansi 2 Color', c.green),
          entry('Ansi 3 Color', c.yellow),
          entry('Ansi 4 Color', c.blue),
          entry('Ansi 5 Color', c.magenta),
          entry('Ansi 6 Color', c.cyan),
          entry('Ansi 7 Color', t.white),
          entry('Ansi 8 Color', t.black_bright),
          entry('Ansi 9 Color', c.red_bright),
          entry('Ansi 10 Color', c.green_bright),
          entry('Ansi 11 Color', c.yellow_bright),
          entry('Ansi 12 Color', c.blue_bright),
          entry('Ansi 13 Color', c.magenta_bright),
          entry('Ansi 14 Color', c.cyan_bright),
          entry('Ansi 15 Color', t.white_bright),
        ].join('\\n');
      }

      else if (currentExport === 'wt') {
        const j = {
          "name": title,
          "background": t.bg,
          "foreground": t.fg,
          "black": t.black,
          "red": c.red, "green": c.green, "blue": c.blue,
          "yellow": c.yellow, "purple": c.magenta, "cyan": c.cyan,
          "white": t.white,
          "brightBlack": t.black_bright,
          "brightRed": c.red_bright, "brightGreen": c.green_bright,
          "brightBlue": c.blue_bright, "brightYellow": c.yellow_bright,
          "brightPurple": c.magenta_bright, "brightCyan": c.cyan_bright,
          "brightWhite": t.white_bright
        };
        out = cmt('// Windows Terminal scheme (settings.json → schemes[])') + '\\n' +
          h(JSON.stringify(j, null, 2));
      }

      else if (currentExport === 'alacritty') {
        out = [
          cmt(\`# \${title} — Alacritty (~/.config/alacritty/alacritty.toml)\`), '',
          \`[colors.primary]\`,
          cl('background =', \`"\${t.bg}"\`),
          cl('foreground =', \`"\${t.fg}"\`), '',
          \`[colors.normal]\`,
          cl('black =', \`"\${t.black}"\`),
          cl('red =', \`"\${c.red}"\`), cl('green =', \`"\${c.green}"\`),
          cl('blue =', \`"\${c.blue}"\`), cl('yellow =', \`"\${c.yellow}"\`),
          cl('magenta =', \`"\${c.magenta}"\`), cl('cyan =', \`"\${c.cyan}"\`),
          cl('white =', \`"\${t.white}"\`), '',
          \`[colors.bright]\`,
          cl('black =', \`"\${t.black_bright}"\`),
          cl('red =', \`"\${c.red_bright}"\`), cl('green =', \`"\${c.green_bright}"\`),
          cl('blue =', \`"\${c.blue_bright}"\`), cl('yellow =', \`"\${c.yellow_bright}"\`),
          cl('magenta =', \`"\${c.magenta_bright}"\`), cl('cyan =', \`"\${c.cyan_bright}"\`),
          cl('white =', \`"\${t.white_bright}"\`)
        ].join('\\n');
      }

      const container = document.getElementById('export-block');
      container.innerHTML = \`<button class="copy-btn" onclick="copyExport()">Copy</button>\\n\` + out;
    }

    function copyExport() {
      const el = document.getElementById('export-block');
      const text = el.innerText.replace('Copy\\n', '').replace('Copy', '');
      navigator.clipboard.writeText(text).then(() => {
        const btn = el.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    }

    function setPreview(id) {
      document.querySelectorAll('.preview-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('preview-' + id).classList.add('active');
      document.querySelectorAll('.preview-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(id === 'banner' ? 'banner' : id));
      });
    }

    let currentColorView = 'cards';
    function setColorView(view) {
      currentColorView = view;
      document.querySelectorAll('.color-view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      document.querySelectorAll('.colors-header .view-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === view);
      });
      renderColorViews();
    }

    const colorMeta = [
      { key: 'red', name: 'Red', light: true },
      { key: 'green', name: 'Green', light: true },
      { key: 'blue', name: 'Blue', light: true },
      { key: 'yellow', name: 'Yellow', light: false },
      { key: 'magenta', name: 'Magenta', light: true },
      { key: 'cyan', name: 'Cyan', light: true },
      { key: 'red_bright', name: 'Bright Red', light: true },
      { key: 'green_bright', name: 'Bright Green', light: true },
      { key: 'blue_bright', name: 'Bright Blue', light: true },
      { key: 'yellow_bright', name: 'Bright Yellow', light: false },
      { key: 'magenta_bright', name: 'Bright Magenta', light: false },
      { key: 'cyan_bright', name: 'Bright Cyan', light: true },
    ];

    function renderColorViews() {
      const mode = document.documentElement.getAttribute('data-theme') || 'dark';
      const t = themes[mode];
      const allColors = { bg: t.bg, fg: t.fg, ...t.colors };

      const listEl = document.getElementById('color-list-view');
      listEl.innerHTML = colorMeta.map(c => {
        const hex = allColors[c.key];
        const desc = t.descs[c.key] || '';
        return \`<div class="color-list-item">
          <div class="color-list-dot" style="background: \${hex}"></div>
          <span class="color-list-name">\${c.name}</span>
          <span class="color-list-hex">\${hex}</span>
          <span class="color-list-desc">\${desc}</span>
        </div>\`;
      }).join('');

      const gridEl = document.getElementById('color-visual-grid');
      gridEl.innerHTML = colorMeta.map(c => {
        const hex = allColors[c.key];
        const textClass = c.light ? 'light-text' : 'dark-text';
        return \`<div class="color-visual-cell \${textClass}" style="background: \${hex}">
          <span>\${hex}</span>
        </div>\`;
      }).join('');
    }

    // Click-to-copy on hex values
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-key], .hex, .color-list-hex');
      if (!el) return;
      const text = el.textContent.trim();
      if (!text.startsWith('#')) return;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copy-toast');
        toast.textContent = \`Copied \${text}\`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1200);
      });
    });

    // Init — default to dark (Night)
    setTheme('dark');
    renderColorViews();

    // Scroll-spy for TOC
    const tocLinks = document.querySelectorAll('.toc a');
    const sections = [...tocLinks].map(a => document.querySelector(a.getAttribute('href')));

    window.addEventListener('scroll', () => {
      let current = sections[0];
      for (const sec of sections) {
        if (sec && sec.getBoundingClientRect().top <= 120) current = sec;
      }
      tocLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + (current ? current.id : ''));
      });
    }, { passive: true });
  </script>
</body>
</html>
`;
