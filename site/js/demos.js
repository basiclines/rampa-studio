    import { typetype } from 'https://unpkg.com/@adrianmg/typetype@0.1.0/dist/index.js';

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
      '.tt-pass{color:#4ade80!important}',
      '.tt-warn{color:#facc15!important}',
    ].join('\n');
    document.head.appendChild(s);

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
    await hero.line(heroColors.map((c,i) => ({ text: '\u2588\u2588 ', className: `tt-swatch-${i}` })), { instant: true });
    await hero.line('', { instant: true });
    await hero.line([kw(':root'), dim(' {')], { instant: true });
    await hero.line([dim('  '), comment('/* base */')], { instant: true });
    for (let i = 0; i < heroColors.length; i++) {
      await hero.line([dim('  '), prop(`--base-${i}`), dim(': '), val(heroColors[i]), dim(';')], { instant: true });
    }
    await hero.line(dim('}'), { instant: true });
    hero.cursor();
    const DEMOS = {
      palette: { title: 'Basic palette', run: runPalette },
      harmony: { title: 'Harmonies', run: runHarmony },
      contrast: { title: 'Contrast lint', run: runContrast },
      colorspace: { title: 'Color space', run: runColorspace },
    };

    let activeDemo = null;

    const TICK = 60; // ms between output lines for step-by-step reveal

    async function runPalette(tt) {
      await tt.line([cmd('rampa'), flag(' -C'), val(' "#3b82f6"'), flag(' -L'), num(' 95:10'), flag(' -S'), num(' 20:100'), flag(' --size='), num('5'), flag(' -O'), val(' css')], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('Generating palette...', { instant: true, spinner: true, muted: true });
      await tt.wait(700);
      await tt.delete(1);
      await tt.line('', { instant: true });
      await tt.line(palColors.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-pal-${i}` })), { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      for (let i = 0; i < palColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), prop(`--base-${i}`), dim(': '), val(palColors[i]), dim(';')], { instant: true });
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
      await tt.line([dim('base:  '), ...baseH.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-hb-${i}` }))], { instant: true });
      await tt.wait(150);
      await tt.line([dim('comp:  '), ...compH.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-hc-${i}` }))], { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      await tt.wait(TICK);
      await tt.line([dim('  '), comment('/* base */')], { instant: true });
      for (let i = 0; i < baseH.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), prop(`--base-${i}`), dim(': '), val(baseH[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line('', { instant: true });
      await tt.line([dim('  '), comment('/* complementary */')], { instant: true });
      for (let i = 0; i < compH.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), prop(`--comp-${i}`), dim(': '), val(compH[i]), dim(';')], { instant: true });
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
      await tt.line([{ text: '  \u25cf Pass', className: 'tt-pass' }, dim('  Preferred body text  (Lc >= 90)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'tt-pass' }, dim('  Body text  (Lc >= 75)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'tt-pass' }, dim('  Large text  (Lc >= 60)')], { instant: true });
      await tt.wait(TICK);
      await tt.line([{ text: '  \u25cf Pass', className: 'tt-pass' }, dim('  Non-text  (Lc >= 15)')], { instant: true });
      await tt.wait(200);
      await tt.line('', { instant: true });
      await tt.line([{ text: '  \u25b2 Warning', className: 'tt-warn' }, dim('  Pure #ffffff \u2014 consider #eeeeee')], { instant: true });
      tt.cursor();
    }

    async function runColorspace(tt) {
      await tt.line([cmd('rampa colorspace'), flag(' --linear'), val(' from=#1e1e2e'), val(' to=#f38ba8'), flag(' --size'), num(' 6'), flag(' -O'), val(' css')], { prefix: '$ ' });
      await tt.wait(400);
      await tt.line('Generating palette...', { instant: true, spinner: true, muted: true });
      await tt.wait(600);
      await tt.delete(1);
      await tt.line('', { instant: true });
      await tt.line(csColors.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-cs-${i}` })), { instant: true });
      await tt.wait(300);
      await tt.line('', { instant: true });
      await tt.line([kw(':root'), dim(' {')], { instant: true });
      for (let i = 0; i < csColors.length; i++) {
        await tt.wait(TICK);
        await tt.line([dim('  '), prop(`--space-${i}`), dim(': '), val(csColors[i]), dim(';')], { instant: true });
      }
      await tt.wait(TICK);
      await tt.line(dim('}'), { instant: true });
      tt.cursor();
    }

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
