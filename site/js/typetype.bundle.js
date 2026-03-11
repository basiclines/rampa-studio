// TypeType v0.1.0 — @adrianmg/typetype (bundled IIFE)
(function () {
  const m = (t) => new Promise((a) => setTimeout(a, t)), v = {
    fast: { speed: 40, variance: 0.2 },
    slow: { speed: 120, variance: 0.4 },
    default: { speed: 80, variance: 0.3 }
  };
  function V(t, a) {
    return typeof t == "string" ? v[t] : {
      speed: t ?? v.default.speed,
      variance: v.default.variance
    };
  }
  function I(t, a) {
    if (a === 0) return t;
    const s = t * a;
    return t + (Math.random() * s * 2 - s);
  }
  function L(t) {
    return t === void 0 ? { before: 0, after: 0 } : typeof t == "number" ? { before: t, after: 0 } : {
      before: t.before ?? 0,
      after: t.after ?? 0
    };
  }
  const w = ["dots", "line", "circle", "square", "arrow", "bounce"];
  function M(t, a = {}) {
    if (!t || !(t instanceof HTMLElement))
      throw new Error("typetype: container must be a valid HTMLElement");
    const s = [];
    let l = null, u = !1;
    function p() {
      l && (l.remove(), l = null);
    }
    function E(n = !0) {
      p();
      const e = document.createElement("p");
      e.className = "typetype-cursor-line", l = document.createElement("span"), l.className = "typetype-cursor" + (n ? " typetype-blink" : ""), l.textContent = a.cursorChar ?? "▋", e.appendChild(l), t.appendChild(e);
    }
    async function h(n, e, i, y) {
      for (const d of e)
        n.textContent += d, await m(I(i, y));
    }
    async function b(n, e = {}) {
      if (u) return;
      const { speed: i, variance: y } = V(
        e.speed ?? a.speed
      ), d = e.variance ?? y, { before: C, after: N } = L(e.delay);
      C > 0 && await m(C), p();
      const f = document.createElement("p");
      f.className = "typetype-line", e.className && (f.className += " " + e.className);
      const x = e.prefix ?? a.prefix;
      if (x) {
        const r = document.createElement("span");
        r.className = "typetype-prefix", r.textContent = x, f.appendChild(r);
      }
      if (e.spinner) {
        const r = document.createElement("span");
        r.className = "typetype-spinner";
        let c = "dots";
        e.spinner !== !0 && (w.includes(e.spinner) ? c = e.spinner : console.warn(
          `typetype: Invalid spinner variant "${e.spinner}", using "dots". Valid: ${w.join(", ")}`
        )), r.dataset.variant = c, f.appendChild(r);
      }
      const o = document.createElement("span");
      if (o.className = "typetype-content", f.appendChild(o), t.appendChild(f), s.push(f), !(n === void 0 || n === "")) {
        if (typeof n == "string")
          e.instant ? o.textContent = n : await h(o, n, i, d);
        else if (Array.isArray(n))
          for (const r of n) {
            const c = document.createElement("span");
            r.className && (c.className = r.className), e.instant ? (c.textContent = r.text, o.appendChild(c)) : (o.appendChild(c), await h(c, r.text, i, d));
          }
      }
      N > 0 && await m(N), e.cursor && E(!0);
    }
    function g(n) {
      return u ? Promise.resolve() : m(n);
    }
    function P(n) {
      if (u) return Promise.resolve();
      for (let e = 0; e < n && s.length > 0; e++) {
        const i = s.pop();
        i == null || i.remove();
      }
      return Promise.resolve();
    }
    function A() {
      s.forEach((n) => n.remove()), s.length = 0, p();
    }
    function S(n = !0) {
      n ? E(!0) : p();
    }
    function T() {
      u = !0;
    }
    function R() {
      return u;
    }
    return {
      line: b,
      wait: g,
      delete: P,
      clear: A,
      cursor: S,
      abort: T,
      isAborted: R
    };
  }

  function typetype(e, o) {
    const n = typeof e == "string" ? document.querySelector(e) : e;
    if (!n)
      throw new Error(`typetype: Element "${e}" not found`);
    return M(n, o);
  }

  window.typetype = typetype;
  window.dispatchEvent(new Event('typetype-ready'));
})();
