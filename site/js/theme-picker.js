/**
 * Theme Picker — Live color customizer
 *
 * Binds to the static HTML structure in index.html.
 * Populates color values, wires up events, lazy-loads presets.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'rampa-theme';
  var STORAGE_NAME_KEY = 'rampa-theme-name';
  var storedPresetName = null;

  var THEME_KEY_MAP = { bg: 'foreground', fg: 'background', r: 'red', g: 'green', b: 'blue', c: 'cyan', m: 'magenta', y: 'yellow' };

  // ── Config / Storage ──────────────────────────────────────────────

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

  // ── Bind to existing DOM ──────────────────────────────────────────

  var trigger = document.querySelector('.tp-trigger');
  var overlay = document.querySelector('.tp-overlay');
  var closeBtn = overlay.querySelector('.tp-close');
  var searchInput = overlay.querySelector('.tp-search');
  var presetList = overlay.querySelector('.tp-preset-list');
  var resetBtn = overlay.querySelector('.tp-reset');

  // Tab switching
  var tabBtns = overlay.querySelectorAll('.tp-tab[data-tp-tab]');
  var tabPanels = overlay.querySelectorAll('.tp-panel[data-tp-panel]');
  for (var i = 0; i < tabBtns.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tp-tab');
        for (var j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove('tp-tab-active');
        for (var j = 0; j < tabPanels.length; j++) tabPanels[j].classList.remove('tp-panel-active');
        btn.classList.add('tp-tab-active');
        var panel = overlay.querySelector('.tp-panel[data-tp-panel="' + target + '"]');
        if (panel) panel.classList.add('tp-panel-active');
        if (target === 'themes') loadThemes();
      });
    })(tabBtns[i]);
  }

  // Trigger dots
  var dots = {};
  var dotEls = trigger.querySelectorAll('.tp-dot[data-color]');
  for (var i = 0; i < dotEls.length; i++) {
    var colorKey = dotEls[i].getAttribute('data-color');
    dots[colorKey] = dotEls[i];
    dotEls[i].style.background = config[colorKey];
  }

  // Color rows
  var pickers = {};
  var rows = overlay.querySelectorAll('.tp-row[data-key]');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var key = row.getAttribute('data-key');
    var swatch = row.querySelector('.tp-swatch');
    var input = row.querySelector('input[type="color"]');
    var hex = row.querySelector('.tp-hex');

    swatch.style.background = config[key];
    input.value = config[key];
    hex.textContent = config[key];

    pickers[key] = { input: input, swatch: swatch, hex: hex };

    (function (k, inp, sw, hx) {
      inp.addEventListener('input', function () {
        var val = inp.value;
        config[k] = val;
        sw.style.background = val;
        hx.textContent = val;
        if (dots[k]) dots[k].style.background = val;
        applyTheme();
      });
    })(key, input, swatch, hex);
  }

  // ── Presets (lazy-loaded) ─────────────────────────────────────────

  var allThemes = null;
  var themesLoading = false;
  var activePresetEl = null;
  var activePresetName = storedPresetName || null;

  function loadThemes() {
    if (allThemes) {
      highlightActive();
      return;
    }
    if (themesLoading) return;
    themesLoading = true;
    fetch('js/ghostty-themes.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allThemes = data;
        renderPresets('');
      })
      .catch(function () { themesLoading = false; });
  }

  function highlightActive() {
    if (!activePresetName) return;
    var items = presetList.querySelectorAll('.tp-preset');
    for (var i = 0; i < items.length; i++) {
      var name = items[i].querySelector('.tp-preset-name');
      if (name && name.textContent === activePresetName) {
        if (activePresetEl) activePresetEl.classList.remove('tp-active');
        items[i].classList.add('tp-active');
        activePresetEl = items[i];
        (function (target) {
          setTimeout(function () { target.scrollIntoView({ block: 'center' }); }, 200);
        })(items[i]);
        break;
      }
    }
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

      var dotsEl = document.createElement('span');
      dotsEl.className = 'tp-preset-dots';
      var colors = [t.r, t.g, t.b, t.c, t.m, t.y];
      for (var j = 0; j < colors.length; j++) {
        var dot = document.createElement('span');
        dot.className = 'tp-preset-dot';
        dot.style.background = colors[j];
        dotsEl.appendChild(dot);
      }
      el.appendChild(dotsEl);

      var nameEl = document.createElement('span');
      nameEl.className = 'tp-preset-name';
      nameEl.textContent = t.name;
      el.appendChild(nameEl);

      el.addEventListener('click', (function (theme, element) {
        return function () { activatePreset(theme, element); };
      })(t, el));

      presetList.appendChild(el);

      if (activePresetName && t.name === activePresetName) {
        el.classList.add('tp-active');
        activePresetEl = el;
        (function (target) {
          setTimeout(function () { target.scrollIntoView({ block: 'center' }); }, 200);
        })(el);
      }
    }
  }

  function activatePreset(theme, el) {
    activePresetName = theme.name;
    selectPresetEl(el);
    for (var tk in THEME_KEY_MAP) {
      var ck = THEME_KEY_MAP[tk];
      if (theme[tk]) config[ck] = theme[tk];
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

  // ── Interactions ──────────────────────────────────────────────────

  var panelOpen = false;

  function openPanel() {
    overlay.classList.add('tp-open');
    panelOpen = true;
    loadThemes();
  }
  function closePanel() {
    overlay.classList.remove('tp-open');
    panelOpen = false;
  }

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  // Close picker when clicking outside overlay (but not on the hero canvas)
  document.addEventListener('click', function (e) {
    if (!panelOpen) return;
    if (overlay.contains(e.target) || trigger.contains(e.target)) return;
    var canvas = document.getElementById('c');
    if (canvas && canvas.contains(e.target)) return;
    closePanel();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
    if (!panelOpen || !allThemes) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
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

  // ── Apply changes (RAF-throttled) ─────────────────────────────────

  var pendingFrame = null;
  var pendingPresetName = null;
  var saveTimer = null;

  function scheduleApply(presetName) {
    pendingPresetName = presetName || null;
    if (!pendingFrame) {
      pendingFrame = requestAnimationFrame(function () {
        pendingFrame = null;
        if (window.RampaTheme) window.RampaTheme.inject(config);
        if (window.rebuildHeroCubes) window.rebuildHeroCubes(config);
        if (window.updateFavicon) window.updateFavicon();
      });
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveToStorage(pendingPresetName);
    }, 300);
  }

  function applyTheme(presetName) {
    scheduleApply(presetName);
  }

  if (hadStored) applyTheme();
})();
