import { PATH_FN } from './_lib.mjs';

// Shared inventory adapted from COPY extraction; no navigation or extra requests.
export async function collectPageInventory(page) {
  return await page.evaluate((pathSrc) => {
    const pathOf = eval(pathSrc);
    const PROPS = ['display', 'position', 'top', 'left', 'right', 'bottom', 'z-index', 'width', 'height', 'max-width', 'min-height', 'padding', 'margin', 'gap', 'grid-template-columns', 'grid-template-rows', 'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content',
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'white-space', 'writing-mode', 'font-feature-settings',
      'color', 'background-color', 'background-image', 'background-size', 'background-position', 'background-attachment', 'opacity', 'transform', 'transform-origin', 'overflow', 'border', 'border-radius', 'box-shadow', 'mix-blend-mode', 'filter', 'backdrop-filter',
      'transition', 'animation', 'will-change', 'object-fit', 'object-position', 'aspect-ratio', 'clip-path', 'mask-image', 'visibility', 'pointer-events', 'cursor', 'inset'];
    const INH = ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'color', 'white-space', 'cursor', 'visibility', 'pointer-events', 'font-feature-settings'];
    const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'PATH', 'G', 'DEFS', 'USE', 'CIRCLE', 'RECT', 'LINE', 'POLYGON', 'POLYLINE', 'CLIPPATH', 'MASK', 'FILTER', 'FEGAUSSIANBLUR', 'FEOFFSET', 'FECOLORMATRIX', 'FEBLEND', 'FEMERGE', 'FEMERGENODE', 'TITLE', 'DESC', 'ELLIPSE', 'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'SYMBOL', 'PATTERN', 'TSPAN']);
    const bg = new Set(); const out = [];
    const walk = (el, depth) => {
      if (SKIP.has(el.tagName)) return;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | ');
      const rec = { d: depth, t: el.tagName.toLowerCase(), id: el.id || undefined, c: typeof el.className === 'string' && el.className ? el.className : undefined,
        r: [Math.round(r.x + scrollX), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], tx: own ? own.slice(0, 160) : undefined };
      for (const a of ['src', 'srcset', 'href', 'alt', 'poster', 'data-src', 'data-srcset', 'data-bg', 'sizes', 'width', 'height', 'loading', 'aria-label', 'type', 'placeholder', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'role']) { const v = el.getAttribute(a); if (v != null) (rec.a ||= {})[a] = v.slice(0, 400); }
      for (const a of el.attributes) if (a.name.startsWith('data-') && !(rec.a && a.name in rec.a) && a.value.length < 80) (rec.a ||= {})[a.name] = a.value;
      const st = {}; const pcs = el.parentElement ? getComputedStyle(el.parentElement) : null;
      for (const p of PROPS) { const v = cs.getPropertyValue(p); if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === '0px' || v === 'static' || v === 'visible' || v === 'rgba(0, 0, 0, 0)' || (v === '1' && p === 'opacity')) continue; if (pcs && INH.includes(p) && pcs.getPropertyValue(p) === v) continue; st[p] = v.length > 240 ? v.slice(0, 240) + '…' : v; }
      if (cs.backgroundImage && cs.backgroundImage !== 'none') for (const m of cs.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) bg.add(m[1]);
      if (el.tagName === 'IMG') { st.naturalW = el.naturalWidth; st.naturalH = el.naturalHeight; st.currentSrc = el.currentSrc; if (el.currentSrc) bg.add(el.currentSrc); }
      for (const ps of ['::before', '::after']) { const p2 = getComputedStyle(el, ps); if (p2.content && p2.content !== 'none' && p2.content !== 'normal') { (rec.pseudo ||= {})[ps] = { content: p2.content, display: p2.display, position: p2.position, w: p2.width, h: p2.height, bg: p2.backgroundColor, bgi: p2.backgroundImage.slice(0, 160), color: p2.color, border: p2.border, transform: p2.transform, top: p2.top, left: p2.left, right: p2.right, bottom: p2.bottom, font: p2.font, opacity: p2.opacity, transition: p2.transition, animation: p2.animation }; for (const m of p2.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) bg.add(m[1]); } }
      rec.s = st; out.push(rec);
      for (const ch of el.children) walk(ch, depth + 1);
    };
    walk(document.body, 0);
    const abs = u => { try { return new URL(u, location.href).href; } catch { return u; } };
    for (const el of document.querySelectorAll('img[srcset], source[srcset], picture source')) for (const c of (el.getAttribute('srcset') || '').split(',')) { const u = c.trim().split(/\s+/)[0]; if (u) bg.add(abs(u)); }
    for (const el of document.querySelectorAll('video, video source, audio source')) for (const a of ['src', 'poster', 'data-src']) { const v = el.getAttribute(a); if (v) bg.add(abs(v)); }
    for (const el of document.querySelectorAll('[data-src],[data-bg],[data-background],[data-lazy]')) for (const a of ['data-src', 'data-bg', 'data-background', 'data-lazy']) { const v = el.getAttribute(a); if (v && !/^data:/.test(v)) bg.add(abs(v)); }
    const fonts = [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
    const anims = document.getAnimations().map(a => { const t = a.effect?.getTiming?.() || {}; return { type: a.constructor.name, name: a.animationName || a.transitionProperty || a.id || '', target: a.effect?.target ? pathOf(a.effect.target) : null, duration: t.duration, delay: t.delay, iterations: t.iterations, easing: t.easing, direction: t.direction, fill: t.fill, playState: a.playState, currentTime: a.currentTime }; });
    const vars = {}; for (const sh of document.styleSheets) { try { for (const rule of sh.cssRules) { if ([':root', 'html', 'body'].includes(rule.selectorText)) for (const p of rule.style) if (p.startsWith('--')) vars[p] = rule.style.getPropertyValue(p).trim(); } } catch {} }
    const g = window.gsap; const STp = window.ScrollTrigger || (g && g.core?.globals?.().ScrollTrigger);
    const libs = {
      gsap: g ? g.version : false, scrollTrigger: STp ? (STp.version || true) : false, pinSpacers: document.querySelectorAll('.pin-spacer').length,
      lenis: !!(window.lenis || window.Lenis || document.documentElement.classList.contains('lenis')), locomotive: !!document.querySelector('[data-scroll-container]'), smoothScrollbar: !!window.Scrollbar,
      swiper: document.querySelectorAll('.swiper, .swiper-container').length, splide: document.querySelectorAll('.splide').length, slick: document.querySelectorAll('.slick-slider').length,
      lottie: !!(window.lottie || window.bodymovin || document.querySelector('lottie-player, [data-lottie], dotlottie-player')), three: !!window.THREE, pixi: !!window.PIXI, barba: !!window.barba, aos: !!window.AOS, wow: !!window.WOW,
      jquery: window.jQuery ? window.jQuery.fn.jquery : false, vue: !!(window.__NUXT__ || window.__VUE__ || document.querySelector('[data-v-app], [data-server-rendered]') || [...document.body.attributes].some(a => a.name.startsWith('data-v-'))), nuxt: !!window.__NUXT__, next: !!window.__NEXT_DATA__, react: !!document.querySelector('[data-reactroot], #__next, #root'),
      shopify: !!window.Shopify, wordpress: !!document.querySelector('link[href*="/wp-content/"], script[src*="/wp-content/"], body[class*="wp-"]'), wix: !!document.querySelector('meta[content*="Wix.com"]'), webflow: !!document.querySelector('html[data-wf-site]'), studio: !!document.querySelector('meta[name="generator"][content*="STUDIO"]'),
      scopedVueAttrs: [...new Set([...document.querySelectorAll('*')].flatMap(e => [...e.attributes].map(a => a.name).filter(n => /^data-v-/.test(n))))].slice(0, 40),
      intersectionObservers: window.__copyIO || [],
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow,
    };
    let scrollTriggers = [];
    try { if (STp?.getAll) scrollTriggers = STp.getAll().map(t => ({ trigger: t.trigger ? pathOf(t.trigger) : null, start: t.start, end: t.end, pin: t.pin ? pathOf(t.pin) : false, scrub: t.vars?.scrub ?? false, markers: !!t.vars?.markers, toggleActions: t.vars?.toggleActions, once: !!t.vars?.once, tweenDuration: t.animation?.duration?.(), targets: (t.animation?.targets?.() || []).slice(0, 6).map(x => x?.nodeType === 1 ? pathOf(x) : String(x)) })); } catch {}
    const videos = [...document.querySelectorAll('video')].map(v => ({ path: pathOf(v), src: v.currentSrc || v.src || [...v.querySelectorAll('source')].map(s => s.src).join(' | '), poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted, playsinline: v.playsInline, paused: v.paused, readyState: v.readyState, duration: v.duration, w: v.videoWidth, h: v.videoHeight, rect: [Math.round(v.getBoundingClientRect().x), Math.round(v.getBoundingClientRect().y + scrollY), Math.round(v.getBoundingClientRect().width), Math.round(v.getBoundingClientRect().height)] }));
    const canvases = [...document.querySelectorAll('canvas')].map(c => ({ path: pathOf(c), ctx: [...(c.__ctxTypes || [])], w: c.width, h: c.height, rect: [Math.round(c.getBoundingClientRect().x), Math.round(c.getBoundingClientRect().y + scrollY), Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)], position: getComputedStyle(c).position, zIndex: getComputedStyle(c).zIndex }));
    const iframes = [...document.querySelectorAll('iframe')].map(f => ({ path: pathOf(f), src: f.src }));
    const svgInline = document.querySelectorAll('svg').length;
    const root = getComputedStyle(document.documentElement);
    return { title: document.title, lang: document.documentElement.lang, scrollHeight: document.documentElement.scrollHeight, bodyBg: getComputedStyle(document.body).backgroundColor, htmlFont: root.fontSize, bodyFont: getComputedStyle(document.body).font, bodyClass: document.body.className, htmlClass: document.documentElement.className,
      els: out, fonts, anims, vars, libs, scrollTriggers, videos, canvases, iframes, svgInline, assets: [...bg], headHtml: document.head.outerHTML, bodyHtml: document.body.outerHTML };
  }, PATH_FN);
}
