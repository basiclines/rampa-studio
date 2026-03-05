/**
 * Rampa Theme — Vanilla JS
 *
 * Generates CSS custom properties from Rampa color spaces and injects
 * them as a <style> tag. No build step needed.
 *
 * Expects `Rampa` global from rampa-sdk.min.js to be loaded first.
 *
 * Variables generated:
 *   --n-1 … --n-10          Neutral ramp (foreground → background)
 *   --r-0-0 … --r-9-9       Red plane (saturation × lightness)
 *   --g-0-0 … --g-9-9       Green plane
 *   --b-0-0 … --b-9-9       Blue plane
 *   --c-0-0 … --c-9-9       Cyan plane
 *   --m-0-0 … --m-9-9       Magenta plane
 *   --y-0-0 … --y-9-9       Yellow plane
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------
  // Anchor colors — change these to re-theme the entire site
  // -------------------------------------------------------------------
  var DEFAULTS = {
    foreground: '#0a0a0a',
    background: '#fafafa',
    red:        '#ef4444',
    green:      '#22c55e',
    blue:       '#3b82f6',
    cyan:       '#06b6d4',
    magenta:    '#a855f7',
    yellow:     '#eab308',
  };

  var GRID = 10;
  var HUES = [
    { alias: 'r', key: 'red' },
    { alias: 'g', key: 'green' },
    { alias: 'b', key: 'blue' },
    { alias: 'c', key: 'cyan' },
    { alias: 'm', key: 'magenta' },
    { alias: 'y', key: 'yellow' },
  ];

  // -------------------------------------------------------------------
  // Core: generate CSS variables string
  // -------------------------------------------------------------------
  function generateVars(config) {
    var cfg = {};
    for (var k in DEFAULTS) cfg[k] = (config && config[k]) || DEFAULTS[k];

    var lines = [];

    // Neutral ramp: --n-1 (darkest) → --n-10 (lightest)
    var neutral = new Rampa.LinearColorSpace(cfg.foreground, cfg.background).size(GRID);
    for (var i = 1; i <= GRID; i++) {
      lines.push('  --n-' + i + ': ' + neutral(i) + ';');
    }

    // Hue planes: --{alias}-{sat}-{lgt}
    for (var h = 0; h < HUES.length; h++) {
      var alias = HUES[h].alias;
      var hueColor = cfg[HUES[h].key];
      var plane = new Rampa.PlaneColorSpace(cfg.foreground, cfg.background, hueColor).size(GRID);

      for (var sat = 0; sat < GRID; sat++) {
        for (var lgt = 0; lgt < GRID; lgt++) {
          lines.push('  --' + alias + '-' + sat + '-' + lgt + ': ' + plane(sat, lgt) + ';');
        }
      }
    }

    return ':root {\n' + lines.join('\n') + '\n}';
  }

  // -------------------------------------------------------------------
  // Inject / update <style id="rampa-theme">
  // -------------------------------------------------------------------
  function inject(config) {
    var css = generateVars(config);

    var el = document.getElementById('rampa-theme');
    if (!el) {
      el = document.createElement('style');
      el.id = 'rampa-theme';
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  // -------------------------------------------------------------------
  // Public API on window
  // -------------------------------------------------------------------
  window.RampaTheme = {
    defaults: DEFAULTS,
    inject: inject,
    generateVars: generateVars,
  };

  // Auto-inject on load
  inject();
})();
