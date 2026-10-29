// blocks.mjs - render captured content blocks (src/content/pages/*.json sections[].blocks) as HTML, word for word
// (PAGES lane owns this file; HOME and the hubs lane import it). Every word inside a block is kept exactly as captured: the
// renderer only chooses markup, classes and decoration (aria-hidden SVG strokes, never text).
//   renderBlocks(blocks, ctx, opts) -> html
//     opts.headingShift  number added to h-levels (0 keeps them)      opts.skipH1   drop the h1
//     opts.ids           a Set: give <details> an id (slug of the question) and keep ids unique on the page
//     opts.reveal        false: no data-reveal attributes (default true on cards, figures, tiles)
//     opts.tone          'night' | 'paper': picks button / glass variants (default from the band via CSS vars)
//     opts.linkStyle     'chips' | 'buttons' (default: buttons, chips for 4+ internal links)
//     opts.imgStyle      'tape' | 'frame' | 'plain' for img blocks (default tape)
//   renderBlock(b, ctx, opts)                        one block (no kicker look-ahead)
//   findSection(doc, pred) / blockText(blocks)       helpers for picking captured content by heading
//   photoSrc(src)                                    captured image path -> /assets/photos|brand/<file>
//   liveHref(u) / fixHtml(html)                      captured "/bayport..." live-menu links -> https://mydealermn.com/bayport...
//   splitByH2(blocks)                                [{ h2, blocks }] chunks in order (first chunk may have h2 null)
//   skLine(cls) / skCorners(cls) / skPlus(cls)       small inline sketch SVGs (pathLength=1, data-draw)
import { esc, escA, attrs, href, linkAttrs, fixLinks, img, stripTags, slugify } from './util.mjs';

export const LIVE_ORIGIN = 'https://mydealermn.com';

// captured "/build/x.webp", "/film/x.jpg" -> /assets/photos/x; "/brand/x" -> /assets/brand/x
export const photoSrc = (src) => {
  const s = String(src).split('?')[0];
  return (s.startsWith('/brand/') ? '/assets/brand/' : '/assets/photos/') + s.split('/').pop();
};

// The live menu stays EXTERNAL (D4): the captured site linked it root-relative ("/bayport", "/bayport/menu/...").
export const liveHref = (u) => {
  const s = String(u ?? '');
  return /^\/bayport(?=$|[/?#])/.test(s) ? LIVE_ORIGIN + s : s;
};
export const fixHtml = (html) => fixLinks(String(html ?? '').replace(/href="(\/bayport(?:[/?#][^"]*)?)"/g, (m, u) => `href="${LIVE_ORIGIN}${u}"`));

const plain = (html) => stripTags(html).replace(/\s+/g, ' ').trim();
const isExt = (u) => /^(https?:)?\/\//i.test(liveHref(u));

// ---------- sketch strokes (decoration only, aria-hidden, drawn on by [data-draw]) ----------
const SK = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';
export const skLine = (cls = '') => `<svg class="b-sk b-sk-line ${cls}" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><path pathLength="1" ${SK} stroke-width="2.2" d="M3 9c40-5 83-6 124-4s86 4 125 0c17-2 31-3 45-1"/></svg>`;
export const skCorners = (cls = '') => `<svg class="b-sk b-sk-corners ${cls}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><path pathLength="1" ${SK} stroke-width="1.6" d="M-3 9h10M2 4v10M93 9h10M98 4v10M-3 91h10M2 86v10M93 91h10M98 86v10"/></svg>`;
export const skPlus = (cls = '') => `<svg class="b-sk b-sk-plus ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path ${SK} stroke-width="2" d="M12 4.5c.2 5 .1 10-.2 15M4.6 12.2c5-.3 10-.2 14.9.1"/></svg>`;
const skArrowR = `<svg class="b-sk b-sk-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path ${SK} stroke-width="2" d="M4 12.4c5-.4 10-.3 15 .1M13.6 6.8c2 2 3.9 3.7 5.6 5.6-1.8 1.7-3.6 3.6-5.3 5.6"/></svg>`;
const skExt = `<svg class="b-sk b-sk-ext" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path ${SK} stroke-width="2" d="M7 17.2 17.1 7M9.4 6.8c2.6-.1 5.2-.1 7.8.2.2 2.6.3 5.2.1 7.8"/></svg>`;
const skQuote = `<svg class="b-sk b-quote__mark" viewBox="0 0 64 48" aria-hidden="true" focusable="false" data-draw><path pathLength="1" ${SK} stroke-width="3" d="M24 8C12 12 6 21 7 31c1 7 6 10 11 9 5-1 7-6 5-10-2-5-8-5-11-2M55 8C43 12 37 21 38 31c1 7 6 10 11 9 5-1 7-6 5-10-2-5-8-5-11-2"/></svg>`;

// ---------- classification helpers ----------
const PRICE = /^\s*[\d.]+\s?g\s*\$[\d.,]+\s*$/;
const FINE = /^(Sources?:|Information current|Drive time and distance|General estimates|For adults 21|This page is general|Prices|Combined quantity)/;
const isKicker = (b, next) => b && b.t === 'p' && next && /^h[1-4]$/.test(next.t) && !/</.test(b.html || '') && plain(b.html).length > 0 && plain(b.html).length <= 48;

function uniqueId(opts, base) {
  if (!opts.ids || !base) return null;
  let id = base, n = 2;
  while (opts.ids.has(id)) id = `${base}-${n++}`;
  opts.ids.add(id);
  return id;
}

export function renderBlocks(blocks, ctx, opts = {}) {
  const list = blocks || [];
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (isKicker(b, list[i + 1]) && !opts.noKicker) { out.push(`<p class="kicker b-kicker">${fixHtml(b.html)}</p>`); continue; }
    out.push(renderBlock(b, ctx, opts, i));
  }
  return out.filter(Boolean).join('\n');
}

const rv = (opts, i) => (opts.reveal === false ? '' : ` data-reveal style="--i:${Math.min(Number(i) || 0, 8)}"`);

export function renderBlock(b, ctx, opts = {}, i = 0) {
  switch (b.t) {
    case 'h1': if (opts.skipH1) return ''; // falls through
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const n = Number(b.t[1]);
      const lvl = Math.min(6, Math.max(1, n + (opts.headingShift || 0)));
      if (b.id && opts.ids) opts.ids.add(b.id);
      const cls = `b-h b-h${n}`;
      return `<h${lvl}${attrs({ id: b.id, class: cls })}>${fixHtml(b.html)}</h${lvl}>${n === 2 && opts.h2Rule === true ? skLine('b-h2-rule') : ''}`;
    }
    case 'p': {
      const t = plain(b.html);
      if (/^Warning:/.test(t)) return `<p class="b-p b-warn">${fixHtml(b.html)}</p>`;
      if (FINE.test(t)) return `<p class="b-p b-fine">${fixHtml(b.html)}</p>`;
      if (/^<strong>[^<]*<\/strong>$/.test(String(b.html).trim()) && t.length < 60) return `<p class="b-p b-stat">${fixHtml(b.html)}</p>`;
      return `<p class="b-p">${fixHtml(b.html)}</p>`;
    }
    case 'text': return `<p class="b-text b-chip">${fixHtml(b.html)}</p>`;
    case 'ul': case 'ol': {
      const items = b.items || [];
      if (items.length && items.every((it) => typeof it === 'string' && PRICE.test(plain(it)))) {
        return `<ul class="b-prices">${items.map((it) => { const m = String(it).match(/^(.*?)(\$.*)$/); return `<li><span class="b-prices__w">${fixHtml(m[1])}</span><span class="b-prices__p">${fixHtml(m[2])}</span></li>`; }).join('')}</ul>`;
      }
      if (items.length && items.every((it) => typeof it === 'object')) {
        return `<${b.t} class="b-steps">${items.map((it, k) => `<li class="b-steps__item"${rv(opts, k)}>${renderBlocks(it.blocks, ctx, { ...opts, h2Rule: false })}</li>`).join('')}</${b.t}>`;
      }
      return `<${b.t} class="b-list">${items.map((it) => `<li>${typeof it === 'string' ? fixHtml(it) : renderBlocks(it.blocks, ctx, opts)}</li>`).join('')}</${b.t}>`;
    }
    case 'dl': return `<dl class="b-dl">${(b.items || []).map((it, k) => `<div class="b-dl__item"${rv(opts, k)}><dt>${fixHtml(it.dt)}</dt>${(it.dd || []).map((d) => `<dd>${fixHtml(d)}</dd>`).join('')}</div>`).join('')}</dl>`;
    case 'quote': return `<figure class="b-quote"${rv(opts, 0)}>${skQuote}<blockquote>${b.html ? `<p>${fixHtml(b.html)}</p>` : renderBlocks(b.blocks, ctx, opts)}</blockquote>${skLine('b-quote__rule')}</figure>`;
    case 'img': {
      const style = opts.imgStyle || 'tape';
      const cls = style === 'tape' ? 'b-img sk-tape b-tape' : style === 'frame' ? 'b-img sk-frame b-frame' : 'b-img';
      const src = photoSrc(b.src);
      const isArt = src.startsWith('/assets/brand/');
      return `<figure class="${cls}${isArt ? ' b-img--art' : ''}"${rv(opts, i)}>${style === 'frame' ? skCorners() : ''}${img({ src, alt: b.alt }, { sizes: opts.sizes || '(min-width: 1024px) 40vw, 100vw' })}</figure>`;
    }
    case 'figure': return renderFigure(b, ctx, opts, i);
    case 'embed': {
      const map = /google\.[a-z.]+\/maps/.test(b.src || '');
      return `<div class="b-embed${map ? ' b-embed--map' : ' b-embed--video'}"${rv(opts, i)}>${skCorners('b-embed__marks')}<div class="b-embed__box"><iframe${attrs({ src: b.src, title: b.title || (map ? 'Map' : 'Video'), loading: 'lazy', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' })}></iframe></div></div>`;
    }
    case 'video': return ''; // the brand film is placed by HOME, not inline
    case 'details': {
      const id = uniqueId(opts, slugify(plain(b.summary)));
      return `<details${attrs({ class: 'b-details', id })}><summary><span class="b-details__q">${fixHtml(b.summary)}</span>${skPlus('b-details__icon')}</summary><div class="b-details__body">${renderBlocks(b.blocks, ctx, { ...opts, reveal: false, h2Rule: false })}</div></details>`;
    }
    case 'card': return `<article class="b-card ${opts.cardCls || ''}"${rv(opts, i)}>${renderBlocks(b.blocks, ctx, opts)}</article>`;
    case 'linkcard': {
      const imgB = (b.blocks || []).find((x) => x.t === 'img');
      const rest = (b.blocks || []).filter((x) => x !== imgB);
      const ext = isExt(b.href);
      return `<a class="b-linkcard"${linkAttrs(liveHref(b.href))}${rv(opts, i)}>${imgB ? `<span class="b-linkcard__media">${img({ src: photoSrc(imgB.src), alt: imgB.alt }, { sizes: '(min-width: 1024px) 25vw, 50vw' })}</span>` : ''}<span class="b-linkcard__body">${renderBlocks(rest, ctx, { ...opts, inLink: true, reveal: false, noKicker: true }).replace(/<p class="b-p">/g, '<span class="b-p">').replace(/<\/p>/g, '</span>').replace(/<p class="([^"]*)">/g, '<span class="$1">')}${ext ? skExt : skArrowR}</span></a>`;
    }
    case 'links': {
      const items = b.items || [];
      const chips = opts.linkStyle === 'chips' || (opts.linkStyle !== 'buttons' && items.length >= 4 && items.every((it) => !isExt(it.href)));
      if (chips) return `<p class="b-links b-links--chips">${items.map((it) => `<a class="b-chiplink"${linkAttrs(liveHref(it.href), it['aria-label'] ? { 'aria-label': it['aria-label'] } : {})}>${fixHtml(it.html)}${skArrowR}</a>`).join(' ')}</p>`;
      return `<p class="b-links">${items.map((it, k) => {
        const ext = isExt(it.href);
        const v = k === 0 ? 'btn--gold' : opts.tone === 'paper' ? 'btn--ghost' : 'btn--glass';
        return `<a class="btn ${v} b-btn"${linkAttrs(liveHref(it.href), it['aria-label'] ? { 'aria-label': it['aria-label'] } : {})}>${it.img ? img({ src: photoSrc(it.img.src), alt: it.img.alt }) : ''}<span>${fixHtml(it.html)}</span>${ext ? skExt : ''}</a>`;
      }).join(' ')}</p>`;
    }
    case 'grid': {
      const kids = b.blocks || [];
      const all = (t) => kids.length && kids.every((k) => k.t === t);
      if (all('details')) return `<div class="b-faq">${renderBlocks(kids, ctx, opts)}</div>`;
      if (all('figure')) {
        const arrow = kids.length === 2 ? `<span class="b-gallery__arrow" aria-hidden="true"><svg viewBox="0 0 120 60" focusable="false" data-draw><path pathLength="1" ${SK} stroke-width="2.4" d="M6 40c22-20 52-28 92-14M86 12c6 5 10 10 13 15-6 3-12 5-18 9"/></svg></span>` : '';
        return `<div class="b-gallery b-gallery--${kids.length}" data-count="${kids.length}">${kids.map((k, n) => renderFigure(k, ctx, { ...opts, tilt: n % 2 ? 'r' : 'l' }, n) + (n === 0 ? arrow : '')).join('')}</div>`;
      }
      if (all('linkcard')) return `<div class="b-grid b-grid--links" data-count="${kids.length}">${renderBlocks(kids, ctx, opts)}</div>`;
      if (all('card')) return `<div class="b-grid b-grid--cards" data-count="${kids.length}">${kids.map((k, n) => renderBlock(k, ctx, opts, n)).join('\n')}</div>`;
      return `<div class="b-grid" data-count="${kids.length}">${renderBlocks(kids, ctx, opts)}</div>`;
    }
    case 'nav': return `<nav class="b-nav"${attrs({ 'aria-label': b.label })}>${renderBlocks(b.blocks, ctx, opts)}</nav>`;
    case 'table': return `<div class="b-table" role="region" tabindex="0"${attrs({ 'aria-label': b.label || 'Table' })}>${fixHtml(b.html)}</div>`;
    case 'svg': {
      if (!opts.inFigure || !b.raw || b.raw.length > 4000 || /<script|\son\w+=/i.test(b.raw)) return '';
      const chart = /role="img"/.test(b.raw);
      return `<span class="b-icon${chart ? ' b-chart' : ''}"${chart ? '' : ' aria-hidden="true"'}>${b.raw.replace(/<svg\s/, '<svg focusable="false" ')}</span>`;
    }
    case 'hidden': return '';
    case 'button': return '';
    default: return `<!-- unknown block ${escA(b.t)} -->`;
  }
}

// figure: a photo with caption (taped / framed), or a set of icon/heading/text cells (the FAQ type and terpene keys)
function renderFigure(b, ctx, opts, i = 0) {
  const kids = b.blocks || [];
  const cap = b.caption ? `<figcaption class="b-fig__cap">${fixHtml(b.caption)}</figcaption>` : '';
  if (kids.length === 1 && kids[0].t === 'img') {
    const im = kids[0];
    const tilt = opts.tilt === 'r' ? ' b-fig--r' : opts.tilt === 'l' ? ' b-fig--l' : '';
    return `<figure class="b-fig b-fig--photo sk-tape${tilt}"${rv(opts, i)}><span class="b-fig__img">${img({ src: photoSrc(im.src), alt: im.alt }, { sizes: opts.sizes || '(min-width: 1024px) 45vw, 100vw' })}</span>${cap}</figure>`;
  }
  // cells: a new cell starts at an svg, or at an h3 not directly preceded by an svg
  const cells = [];
  let cur = null;
  kids.forEach((k, n) => {
    const startsCell = k.t === 'svg' || (/^h[2-4]$/.test(k.t) && !(kids[n - 1] && kids[n - 1].t === 'svg'));
    if (startsCell || !cur) { cur = []; cells.push(cur); }
    cur.push(k);
  });
  if (cells.length > 1) {
    return `<figure class="b-fig b-fig--set"${rv(opts, i)}>${cap}<div class="b-fig__cells" data-count="${cells.length}">${cells.map((c) => `<div class="b-fig__cell">${renderBlocks(c, ctx, { ...opts, inFigure: true, reveal: false, h2Rule: false, noKicker: true })}</div>`).join('')}</div></figure>`;
  }
  return `<figure class="b-fig"${rv(opts, i)}>${renderBlocks(kids, ctx, { ...opts, inFigure: true })}${cap}</figure>`;
}

export function findSection(doc, pred) {
  return (doc.sections || []).find((s) => pred(s));
}

export function blockText(blocks) {
  return (blocks || []).map((b) => [b.html, b.summary, b.caption, (b.items || []).map((i) => (typeof i === 'string' ? i : [i.html, i.dt, ...(i.dd || []), i.blocks ? blockText(i.blocks) : ''].filter(Boolean).join(' '))).join(' '), b.blocks ? blockText(b.blocks) : ''].filter(Boolean).join(' ')).join(' ');
}

// Split a block list into H2 chunks, in order: [{ h2: block|null, blocks: [...] }] (the h2 block is NOT repeated in
// blocks). A kicker paragraph directly before an h2 travels with that h2's chunk.
export function splitByH2(blocks) {
  const chunks = [];
  let cur = { h2: null, kicker: null, blocks: [] };
  const list = blocks || [];
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (b.t === 'h2') {
      let kicker = null;
      const last = cur.blocks[cur.blocks.length - 1];
      if (last && isKicker(last, b)) { kicker = cur.blocks.pop(); }
      if (cur.h2 || cur.blocks.length || cur.kicker) chunks.push(cur);
      cur = { h2: b, kicker, blocks: [] };
    } else cur.blocks.push(b);
  }
  if (cur.h2 || cur.blocks.length || cur.kicker) chunks.push(cur);
  return chunks;
}

export { stripTags, esc, href };
