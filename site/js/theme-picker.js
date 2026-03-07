/**
 * Theme Picker — Live color customizer
 *
 * Floating button (top-right) shows 6 overlapping hue circles.
 * Click to open an overlay with native color pickers for each anchor color.
 * Changes regenerate CSS variables (via RampaTheme.inject) and rebuild the
 * WebGL hero canvas (via window.rebuildHeroCubes).
 */
(function () {
  'use strict';

  var LABELS = [
    { key: 'red',     label: 'Red' },
    { key: 'green',   label: 'Green' },
    { key: 'blue',    label: 'Blue' },
    { key: 'cyan',    label: 'Cyan' },
    { key: 'magenta', label: 'Magenta' },
    { key: 'yellow',  label: 'Yellow' },
  ];

  // We are using a dark mode theme so fb/bg are ivnerted
  var NEUTRAL_LABELS = [
    { key: 'background', label: 'Foreground' },
    { key: 'foreground', label: 'Background' },
  ];

  var STORAGE_KEY = 'rampa-theme';
  var STORAGE_NAME_KEY = 'rampa-theme-name';
  var storedPresetName = null;

  // Current live config — starts from theme defaults, then overrides from localStorage
  var config = {};
  function resetConfig() {
    var d = window.RampaTheme ? window.RampaTheme.defaults : {};
    for (var k in d) config[k] = d[k];
  }
  function loadFromStorage() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        for (var k in parsed) config[k] = parsed[k];
        storedPresetName = localStorage.getItem(STORAGE_NAME_KEY) || null;
        return true;
      }
    } catch (e) {}
    return false;
  }
  function saveToStorage(presetName) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      if (presetName) localStorage.setItem(STORAGE_NAME_KEY, presetName);
      else localStorage.removeItem(STORAGE_NAME_KEY);
    } catch (e) {}
  }
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_NAME_KEY);
    } catch (e) {}
  }
  resetConfig();
  var hadStored = loadFromStorage();

  // ── Build DOM ─────────────────────────────────────────────────────

  // Trigger button
  var trigger = document.createElement('button');
  trigger.className = 'tp-trigger';
  trigger.setAttribute('aria-label', 'Customize theme colors');
  trigger.title = 'Customize theme colors';

  var dotsWrap = document.createElement('span');
  dotsWrap.className = 'tp-dots';
  var dots = {};
  for (var d = 0; d < LABELS.length; d++) {
    var dot = document.createElement('span');
    dot.className = 'tp-dot';
    dot.style.background = config[LABELS[d].key];
    dots[LABELS[d].key] = dot;
    dotsWrap.appendChild(dot);
  }
  trigger.appendChild(dotsWrap);
  document.body.appendChild(trigger);

  // Overlay panel
  var overlay = document.createElement('div');
  overlay.className = 'tp-overlay';

  // Header
  var header = document.createElement('div');
  header.className = 'tp-header';
  var title = document.createElement('span');
  title.className = 'tp-title';
  title.textContent = 'Theme Colors';
  var closeBtn = document.createElement('button');
  closeBtn.className = 'tp-close';
  closeBtn.innerHTML = '&#x2715;';
  closeBtn.setAttribute('aria-label', 'Close theme picker');
  header.appendChild(title);
  header.appendChild(closeBtn);
  overlay.appendChild(header);

  // ── Presets section (lazy-loaded from ghostty-themes.json) ────────
  var presetsSection = document.createElement('div');
  presetsSection.className = 'tp-presets';

  var searchInput = document.createElement('input');
  searchInput.className = 'tp-search';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search 438 themes…';
  presetsSection.appendChild(searchInput);

  var presetList = document.createElement('div');
  presetList.className = 'tp-preset-list';
  presetsSection.appendChild(presetList);
  overlay.appendChild(presetsSection);

  var allThemes = null;
  var themesLoading = false;
  var activePresetEl = null;
  var activePresetName = storedPresetName || null;

  // Map from ghostty compact keys to our config keys
  var THEME_KEY_MAP = { bg: 'foreground', fg: 'background', r: 'red', g: 'green', b: 'blue', c: 'cyan', m: 'magenta', y: 'yellow' };

  function loadThemes() {
    if (allThemes || themesLoading) return;
    themesLoading = true;
    fetch('js/ghostty-themes.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allThemes = data;
        renderPresets('');
      })
      .catch(function () { themesLoading = false; });
  }

  function selectPresetEl(el) {
    if (activePresetEl) activePresetEl.classList.remove('tp-active');
    el.classList.add('tp-active');
    activePresetEl = el;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function renderPresets(query) {
    if (!allThemes) return;
    presetList.innerHTML = '';
    var q = query.toLowerCase();
    for (var i = 0; i < allThemes.length; i++) {
      var t = allThemes[i];
      if (q && t.name.toLowerCase().indexOf(q) < 0) continue;
      var el = document.createElement('div');
      el.className = 'tp-preset';
      el.setAttribute('data-idx', i);
      el.setAttribute('data-name', t.name);

      var dotsEl = document.createElement('span');
      dotsEl.className = 'tp-preset-dots';
      var previewColors = [t.r, t.g, t.b, t.c, t.m, t.y];
      for (var j = 0; j < previewColors.length; j++) {
        var dot = document.createElement('span');
        dot.className = 'tp-preset-dot';
        dot.style.background = previewColors[j];
        dotsEl.appendChild(dot);
      }
      el.appendChild(dotsEl);

      var nameEl = document.createElement('span');
      nameEl.className = 'tp-preset-name';
      nameEl.textContent = t.name;
      el.appendChild(nameEl);

      el.addEventListener('click', (function (theme, element) {
        return function () {
          activatePreset(theme, element);
        };
      })(t, el));

      presetList.appendChild(el);

      // Auto-select stored preset
      if (activePresetName && t.name === activePresetName) {
        el.classList.add('tp-active');
        activePresetEl = el;
        // Scroll into view after DOM settles
        (function (target) {
          setTimeout(function () { target.scrollIntoView({ block: 'nearest' }); }, 50);
        })(el);
      }
    }
  }

  function activatePreset(theme, el) {
    activePresetName = theme.name;
    selectPresetEl(el);
    applyPreset(theme);
  }

  function applyPreset(theme) {
    for (var tk in THEME_KEY_MAP) {
      var ck = THEME_KEY_MAP[tk];
      if (theme[tk]) {
        config[ck] = theme[tk];
      }
    }
    updatePickerUI();
    applyTheme(activePresetName);
  }

  function updatePickerUI() {
    for (var key in pickers) {
      pickers[key].input.value = config[key];
      pickers[key].swatch.style.background = config[key];
      pickers[key].hex.textContent = config[key];
    }
    for (var key in dots) {
      dots[key].style.background = config[key];
    }
  }

  searchInput.addEventListener('input', function () {
    renderPresets(searchInput.value);
  });

  // Keyboard navigation: arrow up/down to jump between presets
  var panelOpen = false;

  document.addEventListener('keydown', function (e) {
    if (!panelOpen) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (!allThemes) return;
    e.preventDefault();

    var items = presetList.children;
    if (!items.length) return;

    var next;
    if (!activePresetEl || !activePresetEl.parentNode) {
      next = e.key === 'ArrowDown' ? items[0] : items[items.length - 1];
    } else {
      next = e.key === 'ArrowDown'
        ? (activePresetEl.nextElementSibling || items[0])
        : (activePresetEl.previousElementSibling || items[items.length - 1]);
    }
    if (!next) return;

    var idx = parseInt(next.getAttribute('data-idx'));
    var theme = allThemes[idx];
    if (theme) activatePreset(theme, next);
  });

  // Body — color rows
  var body = document.createElement('div');
  body.className = 'tp-body';

  var pickers = {};

  function createSection(labelText) {
    var s = document.createElement('div');
    s.className = 'tp-section';
    s.textContent = labelText;
    body.appendChild(s);
  }

  function createRow(key, label) {
    var row = document.createElement('div');
    row.className = 'tp-row';

    var swatch = document.createElement('div');
    swatch.className = 'tp-swatch';
    swatch.style.background = config[key];

    var input = document.createElement('input');
    input.type = 'color';
    input.value = config[key];
    swatch.appendChild(input);

    var lbl = document.createElement('span');
    lbl.className = 'tp-label';
    lbl.textContent = label;

    var hex = document.createElement('span');
    hex.className = 'tp-hex';
    hex.textContent = config[key];

    row.appendChild(swatch);
    row.appendChild(lbl);
    row.appendChild(hex);
    body.appendChild(row);

    pickers[key] = { input: input, swatch: swatch, hex: hex };

    input.addEventListener('input', function () {
      var val = input.value;
      config[key] = val;
      swatch.style.background = val;
      hex.textContent = val;
      if (dots[key]) dots[key].style.background = val;
      applyTheme();
    });
  }

  createSection('Neutral');
  for (var n = 0; n < NEUTRAL_LABELS.length; n++) {
    createRow(NEUTRAL_LABELS[n].key, NEUTRAL_LABELS[n].label);
  }

  createSection('Hues');
  for (var h = 0; h < LABELS.length; h++) {
    createRow(LABELS[h].key, LABELS[h].label);
  }

  overlay.appendChild(body);

  // Footer — reset
  var footer = document.createElement('div');
  footer.className = 'tp-footer';
  var resetBtn = document.createElement('button');
  resetBtn.className = 'tp-reset';
  resetBtn.textContent = 'Reset to defaults';
  footer.appendChild(resetBtn);
  overlay.appendChild(footer);
  document.body.appendChild(overlay);

  // ── Interactions ──────────────────────────────────────────────────

  function openPanel() {
    overlay.classList.add('tp-open');
    panelOpen = true;
    loadThemes();
  }
  function closePanel() {
    overlay.classList.remove('tp-open');
    panelOpen = false;
  }

  trigger.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  resetBtn.addEventListener('click', function () {
    resetConfig();
    clearStorage();
    activePresetName = null;
    updatePickerUI();
    if (activePresetEl) {
      activePresetEl.classList.remove('tp-active');
      activePresetEl = null;
    }
    applyTheme();
  });

  // ── Apply changes ─────────────────────────────────────────────────

  function applyTheme(presetName) {
    saveToStorage(presetName || null);
    if (window.RampaTheme) {
      window.RampaTheme.inject(config);
    }
    if (window.rebuildHeroCubes) {
      window.rebuildHeroCubes(config);
    }
  }
  // Apply stored theme on page load
  if (hadStored) {
    applyTheme();
  }
})();
