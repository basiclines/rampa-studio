(function() {
  async function boot() {
    const { typetype } = window;

    const cmd = (t) => ({ text: t, className: 'tt-cmd' });
    const flag = (t) => ({ text: t, className: 'tt-flag' });
    const val = (t) => ({ text: t, className: 'tt-val' });
    const num = (t) => ({ text: t, className: 'tt-num' });
    const kw = (t) => ({ text: t, className: 'tt-kw' });
    const comment = (t) => ({ text: t, className: 'tt-comment' });
    const prop = (t) => ({ text: t, className: 'tt-prop' });
    const dim = (t) => ({ text: t, muted: true });

    const heroColors = ['#e7f3fe','#bcdbf8','#97c0ed','#76a3de','#5b87c9','#486cab','#44577f','#3b4359','#2d2f37','#191919'];
    const palColors = ['#000000','#143d6b','#4572ba','#b1b9ce','#ffffff'];
    const baseH = ['#000000','#143d6b','#4572ba','#b1b9ce','#ffffff'];
    const compH = ['#000000','#6b4314','#ba8d45','#cec5b1','#ffffff'];
    const csColors = ['#1e1e2e','#3e2d3f','#613e52','#865167','#ac677e','#f38ba8'];

    const s = document.createElement('style');
    s.textContent = [
      ...heroColors.map((c, i) => `.tt-swatch-${i}{color:${c}!important}`),
      ...palColors.map((c, i) => `.tt-pal-${i}{color:${c}!important}`),
      ...baseH.map((c, i) => `.tt-hb-${i}{color:${c}!important}`),
      ...compH.map((c, i) => `.tt-hc-${i}{color:${c}!important}`),
      ...csColors.map((c, i) => `.tt-cs-${i}{color:${c}!important}`),
    ].join('\n');
    document.head.appendChild(s);

    let activeDemo = null;
    let activeTab = 'cli';
    const TICK = 10; // ms between output lines for step-by-step reveal

    // --- Demo definitions (must be before observer) ---
    const DEMOS = {
      // CLI demos
      palette: { title: 'Ramps', run: runPalette },
      harmony: { title: 'Harmonies', run: runHarmony },
      contrast: { title: 'Contrast lint', run: runContrast },
      colorspace: { title: 'Color space', run: runColorspace },
      // SDK demos
      'sdk-ramp': { title: 'Builder API', run: runSdkRamp },
      'sdk-linear': { title: 'Linear space', run: runSdkLinear },
      'sdk-plane': { title: 'Plane space', run: runSdkPlane },
      'sdk-contrast': { title: 'Contrast', run: runSdkContrast },
    };

    // Wire up nav buttons + intersection observer BEFORE hero animation
    document.querySelectorAll('.demo-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchDemo(btn.dataset.demo));
    });

    // Start first demo when the terminal scrolls into view (independent of hero)
    const demoSection = document.getElementById('demo-terminal');
    if (demoSection) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          switchDemo('palette');
        }
      }, { threshold: 0.3 });
      observer.observe(demoSection.closest('section') || demoSection);
    }

    // Hero terminal
    const hero = typetype('#demo-hero', { theme: 'dark' });
    await hero.line([cmd('rampa'), flag(' -C'), val(' "#3b82f6"'), flag(' -L'), num(' 95:10'), flag(' --size='), num('10'), flag(' -O'), val(' css')], { prefix: '$ ' });
    await hero.wait(500);
    await hero.line('Generating palette...', { instant: true, spinner: true, muted: true });
    await hero.wait(700);
    await hero.delete(1);
    await hero.line('', { instant: true });
    await hero.line([kw(':root'), dim(' {')], { instant: true });
    await hero.line([dim('  '), comment('/* base */')], { instant: true });
    for (let i = 0; i < heroColors.length; i++) {
      await hero.line([dim('  '), { text: '\u2588', className: `tt-swatch-${i}` }, dim('  '), prop(`--base-${i}`), dim(': '), val(heroColors[i]), dim(';')], { instant: true });
    }
    await hero.line(dim('}'), { instant: true });
    hero.cursor();

    async function runPalette(tt) {
      await tt.line([cmd('rampa'), flag(' -C'), val(' "#3b82f6"'), flag(' -L'), num(' 95:10'), flag(' -S'), num(' 20:100'), flag(' --size='), num('5'), flag(' -O'), val(' css')], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('Generating palette...', { instant: true, spinner: true, muted: true });
      await tt.wait(700);
      await tt.delete(1);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      for (let i = 0; i < palColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), { text: '\u2588', className: `tt-pal-${i}` }, dim('  '), prop(`--base-${i}`), dim(': '), val(palColors[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line(dim('}'), { instant: true });
      tt.cursor();
    }

    async function runHarmony(tt) {
      await tt.line([cmd('rampa'), flag(' -C'), val(' "#3b82f6"'), flag(' --add='), val('complementary'), flag(' --size='), num('5'), flag(' -O'), val(' css')], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('Generating palette...', { instant: true, spinner: true, muted: true });
      await tt.wait(700);
      await tt.delete(1);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  '), comment('/* base */')], { instant: true });
      for (let i = 0; i < baseH.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), { text: '\u2588', className: `tt-hb-${i}` }, dim('  '), prop(`--base-${i}`), dim(': '), val(baseH[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([dim('  '), comment('/* complementary */')], { instant: true });
      for (let i = 0; i < compH.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), { text: '\u2588', className: `tt-hc-${i}` }, dim('  '), prop(`--comp-${i}`), dim(': '), val(compH[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line(dim('}'), { instant: true });
      tt.cursor();
    }

    async function runContrast(tt) {
      await tt.line([cmd('rampa lint'), flag(' --fg'), val(" '#fff'"), flag(' --bg'), val(" '#1e1e2e'")], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('', { instant: true });
      await tt.line([cmd('Contrast Lint'), dim(' (APCA)')], { instant: true });
      await tt.wait(200);
      await tt.line('', { instant: true });
      await tt.line([dim('  Foreground:  '), val('#ffffff')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  Background:  '), val('#1e1e2e')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  APCA Lc:     '), num('-105.82')], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Preferred body text  (Lc >= 90)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Body text  (Lc >= 75)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Large text  (Lc >= 60)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Non-text  (Lc >= 15)')], { instant: true });
      await tt.wait(200);
      await tt.line('', { instant: true });
      await tt.line([{ text: '  \u25b2 Warning', className: 'text-yellow' }, dim('  Pure #ffffff \u2014 consider #eeeeee')], { instant: true });
      tt.cursor();
    }

    async function runColorspace(tt) {
      await tt.line([cmd('rampa colorspace'), flag(' --linear'), val(' from=#1e1e2e'), val(' to=#f38ba8'), flag(' --size'), num(' 6'), flag(' -O'), val(' css')], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('Generating palette...', { instant: true, spinner: true, muted: true });
      await tt.wait(600);
      await tt.delete(1);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      for (let i = 0; i < csColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), { text: '\u2588', className: `tt-cs-${i}` }, dim('  '), prop(`--space-${i}`), dim(': '), val(csColors[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line(dim('}'), { instant: true });
      tt.cursor();
    }

    // --- SDK demos ---
    async function runSdkRamp(tt) {
      await tt.line([kw('import'), dim(' { '), val('rampa'), dim(' } '), kw('from'), val(' "@basiclines/rampa-sdk"')], { instant: true });
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([kw('const'), dim(' palette = '), cmd('rampa'), dim('('), val('"#3b82f6"'), dim(')')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  .'), prop('size'), dim('('), num('10'), dim(')')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  .'), prop('lightness'), dim('('), num('95'), dim(', '), num('10'), dim(')')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  .'), prop('saturation'), dim('('), num('20'), dim(', '), num('100'), dim(')')], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([dim('palette.'), prop('output'), dim('('), val('"css"'), dim(')')], { instant: true });
      await tt.wait(200);
      await tt.line('', { instant: true });
      await tt.line('', { instant: true });
      await tt.line([comment('// → :root {')], { instant: true });
      for (let i = 0; i < palColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([comment(`//     `), { text: '\u2588', className: `tt-pal-${i}` }, comment(`  --base-${i}: ${palColors[i]};`)], { instant: true });
      }
      await tt.line([comment('//   }')], { instant: true });
      tt.cursor();
    }

    async function runSdkLinear(tt) {
      await tt.line([kw('import'), dim(' { '), val('LinearColorSpace'), dim(' } '), kw('from'), val(' "@basiclines/rampa-sdk"')], { instant: true });
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([kw('const'), dim(' ramp = '), kw('new'), cmd(' LinearColorSpace'), dim('('), val('"#1e1e2e"'), dim(', '), val('"#f38ba8"'), dim(')')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  .'), prop('size'), dim('('), num('6'), dim(')')], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      for (let i = 0; i < csColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim(`ramp(${i + 1})  `), comment(`// → ${csColors[i]}`), { text: '  \u2588', className: `tt-cs-${i}` }], { instant: true });
      }
      tt.cursor();
    }

    async function runSdkPlane(tt) {
      await tt.line([kw('import'), dim(' { '), val('PlaneColorSpace'), dim(' } '), kw('from'), val(' "@basiclines/rampa-sdk"')], { instant: true });
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([kw('const'), dim(' plane = '), kw('new'), cmd(' PlaneColorSpace'), dim('(')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  '), val('"#0a0a0a"'), dim(', '), comment('// dark anchor')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  '), val('"#fafafa"'), dim(', '), comment('// light anchor')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  '), val('"#3b82f6"'), dim('  '), comment('// hue anchor')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim(').'), prop('size'), dim('('), num('10'), dim(')')], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line('', { instant: true });
      await tt.line([comment('// plane(sat, lgt) → 10×10 grid')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('plane('), num('0'), dim(', '), num('0'), dim(')  '), comment('// → dark achromatic')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('plane('), num('0'), dim(', '), num('9'), dim(')  '), comment('// → light achromatic')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('plane('), num('9'), dim(', '), num('5'), dim(')  '), comment('// → full blue, mid-light')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('plane('), num('9'), dim(', '), num('9'), dim(')  '), comment('// → brightest blue')], { instant: true });
      tt.cursor();
    }

    async function runSdkContrast(tt) {
      await tt.line([kw('import'), dim(' { '), val('rampa'), dim(' } '), kw('from'), val(' "@basiclines/rampa-sdk"')], { instant: true });
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([kw('const'), dim(' result = '), cmd('rampa'), dim('.'), prop('contrast'), dim('('), val('"#ffffff"'), dim(', '), val('"#1e1e2e"'), dim(')')], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([dim('result.'), prop('score'), dim('    '), comment('// -105.82')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('result.'), prop('pass'), dim('     '), comment('// true')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('result.'), prop('levels'), dim('   '), comment('// [')], { instant: true });
      await tt.wait(TICK);
      await tt.line([comment('//   { name: "Preferred body text", '), { text: 'pass: true', className: 'text-green' }, comment(' }')], { instant: true });
      await tt.wait(TICK);
      await tt.line([comment('//   { name: "Body text", '), { text: 'pass: true', className: 'text-green' }, comment(' }')], { instant: true });
      await tt.wait(TICK);
      await tt.line([comment('//   { name: "Large text", '), { text: 'pass: true', className: 'text-green' }, comment(' }')], { instant: true });
      await tt.wait(TICK);
      await tt.line([comment('//   { name: "Non-text", '), { text: 'pass: true', className: 'text-green' }, comment(' }')], { instant: true });
      await tt.wait(TICK);
      await tt.line([comment('// ]')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('result.'), prop('warnings'), dim(' '), comment('// ["Pure #ffffff…"]')], { instant: true });
      tt.cursor();
    }

    // --- Tab switching ---
    function switchTab(tab) {
      if (activeTab === tab) return;
      activeTab = tab;

      // Update tab buttons (only demo section ones with data-tab, not data-cta-tab)
      document.querySelectorAll('.demo-tab[data-tab]').forEach(btn => {
        btn.classList.toggle('demo-tab-active', btn.dataset.tab === tab);
      });

      // Show/hide nav items
      document.querySelectorAll('.demo-nav-btn').forEach(btn => {
        btn.style.display = btn.dataset.tab === tab ? '' : 'none';
        btn.classList.remove('demo-nav-active');
      });

      // Activate the first item in the new tab
      const firstBtn = document.querySelector(`.demo-nav-btn[data-tab="${tab}"]`);
      if (firstBtn) {
        firstBtn.classList.add('demo-nav-active');
        switchDemo(firstBtn.dataset.demo);
      }
    }

    document.querySelectorAll('.demo-tab[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    async function switchDemo(key) {
      if (activeDemo === key) return;
      activeDemo = key;

      // Update nav buttons
      document.querySelectorAll('.demo-nav-btn').forEach(btn => {
        btn.classList.toggle('demo-nav-active', btn.dataset.demo === key);
      });

      // Update terminal title
      const titleEl = document.getElementById('demo-term-title');
      if (titleEl) titleEl.textContent = DEMOS[key].title;

      // Clear and re-render terminal
      const container = document.getElementById('demo-terminal');
      container.innerHTML = '';
      const tt = typetype(container, { theme: 'dark' });
      await DEMOS[key].run(tt);
    }
  }

  // Wait for typetype to be loaded from CDN
  if (window.typetype) {
    boot();
  } else {
    window.addEventListener('typetype-ready', boot, { once: true });
  }
})();
