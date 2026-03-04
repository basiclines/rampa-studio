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
      ...csColors.map((c, i) => `.tt-cs-${i}{color:${c}!important}`)
    ].join('\n');
    document.head.appendChild(s);

    // Hero
    const hero = typetype('#demo-hero', { theme: 'dark' });
    await hero.line([cmd('rampa'), flag(' -C'), val(' \"#3b82f6\"'), flag(' -L'), num(' 95:10'), flag(' --size='), num('10'), flag(' -O'), val(' css')], { prefix: '$ ' });
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

    // CLI \u2014 Basic palette
    const palette = typetype('#demo-palette', { theme: 'dark' });
    await palette.line([cmd('rampa'), flag(' -C'), val(' \"#3b82f6\"'), flag(' --size='), num('5'), flag(' -O'), val(' css')], { prefix: '$ ' });
    await palette.wait(400);
    await palette.line('Generating palette...', { instant: true, spinner: true, muted: true });
    await palette.wait(700);
    await palette.delete(1);
    await palette.line('', { instant: true });
    await palette.line(palColors.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-pal-${i}` })), { instant: true });
    await palette.line('', { instant: true });
    await palette.line([kw(':root'), dim(' {')], { instant: true });
    for (let i = 0; i < palColors.length; i++) {
      await palette.line([dim('  '), prop(`--base-${i}`), dim(': '), val(palColors[i]), dim(';')], { instant: true });
    }
    await palette.line(dim('}'), { instant: true });
    palette.cursor();

    // CLI \u2014 Harmonies
    const harmony = typetype('#demo-harmony', { theme: 'dark' });
    await harmony.line([cmd('rampa'), flag(' -C'), val(' \"#3b82f6\"'), flag(' --add='), val('complementary'), dim(' \\')], { prefix: '$ ' });
    await harmony.line([dim('  '), flag('--size='), num('5'), flag(' -O'), val(' css')], { speed: 'fast' });
    await harmony.wait(400);
    await harmony.line('Generating palette...', { instant: true, spinner: true, muted: true });
    await harmony.wait(700);
    await harmony.delete(1);
    await harmony.line('', { instant: true });
    await harmony.line([dim('base:  '), ...baseH.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-hb-${i}` }))], { instant: true });
    await harmony.line([dim('comp:  '), ...compH.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-hc-${i}` }))], { instant: true });
    await harmony.line('', { instant: true });
    await harmony.line([kw(':root'), dim(' {')], { instant: true });
    await harmony.line([dim('  '), comment('/* base */')], { instant: true });
    for (let i = 0; i < baseH.length; i++) {
      await harmony.line([dim('  '), prop(`--base-${i}`), dim(': '), val(baseH[i]), dim(';')], { instant: true });
    }
    await harmony.line('', { instant: true });
    await harmony.line([dim('  '), comment('/* complementary */')], { instant: true });
    for (let i = 0; i < compH.length; i++) {
      await harmony.line([dim('  '), prop(`--comp-${i}`), dim(': '), val(compH[i]), dim(';')], { instant: true });
    }
    await harmony.line(dim('}'), { instant: true });
    harmony.cursor();

    // CLI \u2014 Contrast lint
    const contrast = typetype('#demo-contrast', { theme: 'dark' });
    await contrast.line([cmd('rampa lint'), flag(' --fg'), val(" '#fff'"), flag(' --bg'), val(" '#1e1e2e'")], { prefix: '$ ' });
    await contrast.wait(400);
    await contrast.line('', { instant: true });
    await contrast.line([cmd('Contrast Lint'), dim(' (APCA)')], { instant: true });
    await contrast.line('', { instant: true });
    await contrast.line([dim('  Foreground:  '), val('#ffffff')], { instant: true });
    await contrast.line([dim('  Background:  '), val('#1e1e2e')], { instant: true });
    await contrast.line([dim('  APCA Lc:     '), num('-105.82')], { instant: true });
    await contrast.line('', { instant: true });
    await contrast.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Preferred body text  (Lc >= 90)')], { instant: true });
    await contrast.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Body text  (Lc >= 75)')], { instant: true });
    await contrast.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Large text  (Lc >= 60)')], { instant: true });
    await contrast.line([{ text: '  \u25cf Pass', className: 'text-green' }, dim('  Non-text  (Lc >= 15)')], { instant: true });
    await contrast.line('', { instant: true });
    await contrast.line([{ text: '  \u25b2 Warning', className: 'text-yellow' }, dim('  Pure #ffffff \u2014 consider #eeeeee')], { instant: true });
    contrast.cursor();

    // CLI \u2014 Color space
    const cs = typetype('#demo-colorspace', { theme: 'dark' });
    await cs.line([cmd('rampa colorspace'), dim(' \\')], { prefix: '$ ' });
    await cs.line([dim('  '), flag('--linear'), val(' from=#1e1e2e'), val(' to=#f38ba8'), dim(' \\')], { speed: 'fast' });
    await cs.line([dim('  '), flag('--size'), num(' 6'), flag(' -O'), val(' css')], { speed: 'fast' });
    await cs.wait(400);
    await cs.line('Generating palette...', { instant: true, spinner: true, muted: true });
    await cs.wait(600);
    await cs.delete(1);
    await cs.line('', { instant: true });
    await cs.line(csColors.map((c,i) => ({ text: '\u2588\u2588\u2588\u2588 ', className: `tt-cs-${i}` })), { instant: true });
    await cs.line('', { instant: true });
    await cs.line([kw(':root'), dim(' {')], { instant: true });
    for (let i = 0; i < csColors.length; i++) {
      await cs.line([dim('  '), prop(`--space-${i}`), dim(': '), val(csColors[i]), dim(';')], { instant: true });
    }
    await cs.line(dim('}'), { instant: true });
    cs.cursor();
