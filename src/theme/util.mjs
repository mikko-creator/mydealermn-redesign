// util.mjs - shared helpers (FOUNDATION owns this file; others import, never edit - ask through your report).
import { img, picture, imgUrl, hasGenerated } from '../lib/images.mjs';
export { img, picture, imgUrl, hasGenerated };

// Generated image by id (see docs/BUILD-CONTRACT.md "Generated image ids"). While IMAGERY is still producing, a lane
// build with ALLOW_MISSING_GEN=1 gets a styled placeholder slot instead of a build failure; the final build (no env)
// fails on any missing id.
export function gimg(id, opts = {}) {
  if (hasGenerated(id) || process.env.ALLOW_MISSING_GEN !== '1') return img(id, opts);
  return `<span class="img-slot ${opts.cls || ''}" data-slot="${String(id).replace(/"/g, '')}" role="img" aria-label="${String(opts.alt || '').replace(/"/g, '&quot;')}"></span>`;
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escA = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v !== false && v != null && v !== '').map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escA(v)}"`)).join('');

export const LIVE_ORIGIN = 'https://mydealermn.com';
export const isExternal = (u) => /^(https?:)?\/\//i.test(String(u)) || /^(mailto|tel|sms):/i.test(String(u));

// Internal page paths are written as directories ("/flower" -> "/flower/"), so every internal link gets the trailing
// slash; "#frag" and "?q" survive; files ("/404.html", "/assets/...") are left alone. External URLs unchanged.
export function href(u) {
  const s = String(u ?? '');
  if (!s || isExternal(s) || s.startsWith('#')) return s;
  // the live menu is external (contract D4): captured "/bayport" and "/bayport/menu/..." links go to the live site
  if (/^\/bayport(?:[/?#]|$)/.test(s)) return LIVE_ORIGIN + s;
  const m = s.match(/^([^?#]*)([?#].*)?$/);
  let p = m[1];
  const rest = m[2] || '';
  if (!p.startsWith('/')) return s;
  if (p.startsWith('/assets/') || /\.[a-z0-9]{2,5}$/i.test(p)) return s;
  if (!p.endsWith('/')) p += '/';
  return p + rest;
}

// <a> attributes for any URL: external links open in a new tab with rel noopener (mailto/tel stay in place).
export function linkAttrs(u, extra = {}) {
  const h = href(String(u ?? ''));
  const ext = /^(https?:)?\/\//i.test(h);
  return attrs({ href: h, ...(ext ? { target: '_blank', rel: 'noopener' } : {}), ...extra });
}

// Rewrite the root-absolute links inside captured inline HTML (paragraphs from the block JSON) to the trailing-slash
// form, and give external links target/rel. Text is never touched.
export function fixLinks(html) {
  return String(html ?? '').replace(/<a\s([^>]*?)href="([^"]*)"([^>]*)>/g, (all, pre, u, post) => {
    const rest = (pre + post).replace(/\s?(target|rel)="[^"]*"/g, '');
    return `<a ${rest.trim() ? rest.trim() + ' ' : ''}${linkAttrs(u.replace(/&amp;/g, '&')).trim()}>`;
  });
}

// Photo registry (src/content/images.json, written by IMAGERY): photo(id, opts) -> <img> for a client photo by id.
// Falls back to the captured source path under /assets/photos/ when the id is a path.
export function photo(ctx, id, opts = {}) {
  const p = (ctx.images.photos || {})[id];
  if (p) return img({ src: p.src, w: p.w, h: p.h, alt: p.alt }, opts);
  if (String(id).startsWith('/assets/')) return img({ src: id }, opts);
  throw new Error('missing image: unknown photo id "' + id + '"');
}

export const slugify = (s) => String(s).toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const stripTags = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ---------- sketch SVG helpers (FOUNDATION) ----------
// Every helper returns an inline <svg class="sk ..." data-draw aria-hidden="true">; its paths carry pathLength="1" and
// class "sk-p", so motion.css draws them on when site.js marks the svg .is-in. The rough pencil edge is the shared
// filter #sk-rough that the shell writes once per page (skDefs()). Colour = currentColor (see sketch.css).
//   skUnderline({ cls, hover })  under a word: <span class="scribble">word${skUnderline()}</span>
//                                hover: true -> draws only while the parent .sk-hover is hovered/focused
//   skCircle({ cls })            loop around a word/object: <span class="sk-circled">x${skCircle()}</span>
//   skArrow(dir, { cls })        dir: right | left | down | up | down-right | down-left
//   skFrame({ cls })             rough outline inside a .sk-frame (photo with registration marks)
//   skPath(d, { vb, cls, sw })   any hand path(s): d = string or array of path data, vb = viewBox
//   skDefs()                     the shared <defs> (shell only)
const skSvg = (vb, inner, cls, { par = 'none', rough = true } = {}) =>
  `<svg class="sk ${cls}" viewBox="${vb}" preserveAspectRatio="${par}" aria-hidden="true" focusable="false" data-draw>${rough ? `<g filter="url(#sk-rough)">${inner}</g>` : inner}</svg>`;
const skP = (d, extra = '') => `<path class="sk-p" pathLength="1" d="${d}"${extra}/>`;

export function skDefs() {
  return `<svg class="sk-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs><filter id="sk-rough" x="-15%" y="-60%" width="130%" height="220%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>`;
}
export function skUnderline({ cls = '', hover = false } = {}) {
  return skSvg('0 0 200 20', skP('M3 13C40 7 90 6 140 8S190 11 197 7') + skP('M28 17C74 13 122 13 172 15', ' style="--d:.45s" opacity="0.7"'), `sk-underline${hover ? ' sk-underline--hover' : ''} ${cls}`.trim(), { rough: false });
}
export function skCircle({ cls = '' } = {}) {
  return skSvg('0 0 200 100', skP('M112 7C58 1 9 20 10 52C11 84 66 97 118 93C168 89 196 66 190 39C185 15 146 4 86 11'), `sk-circle ${cls}`.trim());
}
export function skArrow(dir = 'right', { cls = '' } = {}) {
  return skSvg('0 0 120 60', skP('M5 44C30 14 70 8 110 22') + skP('M93 9L111 22L95 37', ' style="--d:.9s"'), `sk-arrow sk-arrow--${dir} ${cls}`.trim(), { par: 'xMidYMid meet' });
}
export function skFrame({ cls = '' } = {}) {
  return skSvg('0 0 100 100', skP('M2 3C30 1.5 70 2.5 98 2M98.5 2C97.5 35 99 68 97.5 98M98 97.5C66 99 33 97 1.5 98.5M2 98C3 64 1 32 2.5 1.5'), `sk-frame__marks ${cls}`.trim());
}
export function skPath(d, { vb = '0 0 100 100', cls = '', sw = '', par = 'xMidYMid meet', rough = true } = {}) {
  const ds = Array.isArray(d) ? d : [d];
  return skSvg(vb, ds.map((x, i) => skP(x, ` style="--d:${(i * 0.18).toFixed(2)}s"`)).join(''), `sk-path ${cls}`.trim(), { par, rough }).replace('<svg ', sw ? `<svg stroke-width="${sw}" ` : '<svg ');
}
