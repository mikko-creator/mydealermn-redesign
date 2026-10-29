// pages.mjs - the 20 captured pages (word for word from ctx.content[slug]) + /404.html, in the "Sketchbook Noir"
// look (PAGES lane). Page types: category guide, area guide (+ /wisconsin) with a sticky contents rail, long guide
// (/cannabis-101), /faq (grouped accordions + client-side filter), /company, /build (taped sketchbook gallery),
// /contact, /jobs, /privacy, /shop, /404.html. Head metadata = the captured title/description/canonical/og/jsonld.
// Classes: FOUNDATION's contract classes + this lane's p- prefix (blocks use b-, see blocks.mjs).
import { page } from './shell.mjs';
import { esc, escA, attrs, href, linkAttrs, img, gimg, stripTags } from './util.mjs';
import { renderBlocks, renderBlock, splitByH2, skLine, skCorners, fixHtml, LIVE_ORIGIN } from './blocks.mjs';

const kick = (b) => (b ? `<p class="kicker b-kicker">${fixHtml(b.html)}</p>` : '');

const MENU = LIVE_ORIGIN + '/bayport';

const CATS = {
  flower: { bg: 'g-bud-macro', sketch: 's-bud' },
  'pre-rolls': { bg: 'g-prerolls', sketch: 's-bud' },
  edibles: { bg: 'g-edibles', sketch: 's-jar' },
  vapes: { bg: 'g-vape', sketch: 's-hat' },
  beverages: { bg: 'g-beverage', sketch: 's-jar' },
};
const PHOTO = {
  'exterior-front.webp': 'My Dealer storefront at 243 3rd Street North, with the cartoon head and name on the brick',
  'sign.webp': 'Illuminated My Dealer sign on the Bayport storefront',
  'exterior-front-after.webp': 'The sign is up',
  'parking-after.webp': 'Paved customer parking',
  'interior-service-doors.webp': 'Finished retail floor',
  'interior-security-windows.webp': 'Security checkpoint windows between the lobby and the sales floor',
};
const AREAS = {
  stillwater: 'exterior-front.webp',
  'oak-park-heights': 'interior-security-windows.webp',
  'hudson-wi': 'exterior-front-after.webp',
  'river-falls-wi': 'parking-after.webp',
  'somerset-wi': 'interior-service-doors.webp',
  'new-richmond-wi': 'sign.webp',
  wisconsin: 'exterior-front.webp',
};

// ---------- breadcrumbs from the adopted IA ----------
const SECTION = {
  explore: ['/blog/shopping-and-reviews/', 'Explore'],
  dispensaries: ['/dispensaries/', 'Dispensaries'],
  resources: ['/blog/', 'Resources'],
  about: ['/company/', 'About Us'],
};
const SECTION_OF = {
  flower: 'explore', 'pre-rolls': 'explore', edibles: 'explore', vapes: 'explore', beverages: 'explore', shop: 'explore',
  stillwater: 'dispensaries', 'oak-park-heights': 'dispensaries', 'hudson-wi': 'dispensaries', 'river-falls-wi': 'dispensaries', 'somerset-wi': 'dispensaries', 'new-richmond-wi': 'dispensaries', wisconsin: 'dispensaries',
  'cannabis-101': 'resources', faq: 'resources',
  company: 'about', build: 'about', jobs: 'about', contact: 'about', privacy: 'about',
};
const LABEL_OVERRIDE = { shop: 'How to shop', faq: 'FAQ', company: 'About Us' };

function iaLabels(ia) {
  const m = new Map();
  const add = (h, l) => { const k = String(h).replace(/^\/+|\/+$/g, ''); if (k && !/^https?:/.test(h) && !m.has(k)) m.set(k, l); };
  for (const n of ia.nav || []) { if (n.href) add(n.href, n.label); for (const g of n.mega || []) for (const [h, l] of g.links || []) add(h, l); }
  for (const [h, l] of [...((ia.footer || {}).primary || []), ...((ia.footer || {}).moreInfo || [])]) add(h, l);
  return m;
}

function crumbsFor(ctx, slug) {
  const labels = iaLabels(ctx.ia);
  const label = LABEL_OVERRIDE[slug] || labels.get(slug) || stripTags(ctx.content[slug].title.split('|')[0]).trim();
  const sec = SECTION[SECTION_OF[slug]];
  const c = [['/', 'Home']];
  if (sec && sec[0] !== `/${slug}/`) c.push(sec);
  c.push([`/${slug}/`, label]);
  return c;
}

// ---------- small pieces ----------
const sketchImg = (id, cls = '') => `<span class="p-sketch ${cls}" aria-hidden="true">${gimg(id, { alt: '', eager: true, sizes: '(min-width: 1024px) 22vw, 120px', cls: 'p-sketch__img' })}</span>`;
const photoImg = (file, opts = {}) => img({ src: '/assets/photos/' + file, alt: opts.alt != null ? opts.alt : PHOTO[file] || '' }, { sizes: opts.sizes || '100vw', eager: !!opts.eager, cls: opts.cls });
const plainText = (blocks) => JSON.stringify(blocks || []);

// a short hand annotation, only when the phrase is My Dealer's own words on this page (checked here)
function note(doc, phrase, cls = '') {
  const all = stripTags(plainText(doc.sections)).toLowerCase();
  if (!phrase || !all.includes(phrase.toLowerCase())) return '';
  return `<p class="sk-note p-note ${cls}" aria-hidden="true">${esc(phrase)}</p>`;
}


// page hero: first captured section (kicker, H1, intro, CTAs) on glass over a fitting image, a sketch protruding
function hero(ctx, doc, { media = '', sketch = '', notes = '', blocks, ids, mod = '', after = '' }) {
  const body = renderBlocks(blocks || doc.sections[0].blocks, ctx, { ids, tone: 'night', reveal: false });
  return `<section class="band band--night band--over p-hero ${mod}">
${media ? `<div class="band__clip p-hero__clip"><div class="p-hero__media">${media}</div><span class="p-hero__shade" aria-hidden="true"></span></div>` : ''}
<div class="wrap p-hero__inner">
<div class="glass glass--night p-hero__panel">${skCorners('p-hero__marks')}${body}</div>
${notes}
</div>
${sketch ? `<div class="p-hero__protrude protrude">${sketch}</div>` : ''}
${after}
</section>`;
}

// a band of content (night or paper) with clip layer
function band(tone, inner, { mod = '', id = '', label = '' } = {}) {
  return `<section${attrs({ class: `band band--${tone} p-band p-band--${tone} ${mod}`.trim(), id: id || null, 'aria-labelledby': label || null })}>
${inner}
</section>`;
}

// split a chunk's blocks into a lead (before the first h3) and h3 groups (each h3 + what follows until the next h3)
function h3Groups(blocks) {
  const lead = [];
  const groups = [];
  let cur = null;
  for (const b of blocks) {
    if (b.t === 'h3') { cur = [b]; groups.push(cur); continue; }
    if (cur) cur.push(b); else lead.push(b);
  }
  return { lead, groups };
}

// one H2 chunk of a guide as an editorial band: number + heading on the left, content on the right
function chunkBand(ctx, ch, n, tone, ids, { cards = true } = {}) {
  const opts = { ids, tone };
  const head = ch.h2 ? `<header class="p-chunk__head">${ch.kicker ? kick(ch.kicker) : `<p class="p-chunk__num" aria-hidden="true">${String(n).padStart(2, '0')}</p>`}${renderBlock(ch.h2, ctx, opts)}${skLine('p-chunk__rule')}</header>` : '';
  const { lead, groups } = h3Groups(ch.blocks);
  let body;
  if (cards && groups.length >= 2 && groups.every((g) => g.length <= 6)) {
    // trailing fine print after the last group stays after the cards
    body = `${renderBlocks(lead, ctx, opts)}<div class="p-cards" data-count="${groups.length}">${groups.map((g, k) => `<article class="p-card glass ${tone === 'night' ? 'glass--night' : 'glass--milk'} glass--lift" data-reveal style="--i:${k % 6}">${renderBlocks(g, ctx, opts)}</article>`).join('')}</div>`;
  } else body = renderBlocks(ch.blocks, ctx, opts);
  return band(tone, `<div class="wrap p-chunk${ch.h2 ? '' : ' p-chunk--nohead'}">${head}<div class="p-chunk__body">${body}</div></div>`, { mod: 'p-band--chunk' });
}

function out(ctx, slug, main, { bodyClass = '', jsonld } = {}) {
  const doc = ctx.content[slug];
  return {
    path: `/${slug}/`,
    html: page({ ctx, path: `/${slug}/`, title: doc.title, description: doc.description, canonical: doc.canonical, og: doc.og, jsonld: jsonld || doc.jsonld, bodyClass: `p-page p-page--${slug} ${bodyClass}`.trim(), main, crumbs: crumbsFor(ctx, slug) }),
  };
}

// ---------- page types ----------
function categoryPage(ctx, slug) {
  const doc = ctx.content[slug];
  const ids = new Set();
  const cfg = CATS[slug];
  const media = gimg(cfg.bg, { alt: '', eager: true, sizes: '100vw', cls: 'p-hero__img' });
  const h = hero(ctx, doc, { media, ids, sketch: sketchImg(cfg.sketch, 'p-sketch--hero'), mod: 'p-hero--cat' });
  const card = doc.sections[1].blocks;
  const inner = card.length === 1 && card[0].t === 'card' ? card[0].blocks : card;
  const chunks = splitByH2(inner);
  const bands = chunks.map((ch, k) => chunkBand(ctx, ch, k + 1, k % 2 ? 'night' : 'paper', ids)).join('\n');
  return out(ctx, slug, h + bands, { bodyClass: 'p-type-cat' });
}

function railFrom(chunks, label = 'On this page') {
  const items = chunks.filter((c) => c.h2 && c.h2.id).map((c) => `<li><a href="#${escA(c.h2.id)}">${esc(stripTags(c.h2.html))}</a></li>`);
  if (items.length < 3) return '';
  return `<nav class="p-rail glass glass--milk" aria-label="${escA(label)}"><p class="p-rail__title">${esc(label)}</p><ol class="p-rail__list">${items.join('')}</ol></nav>`;
}

const RAIL_JS = `<script>(function(){var r=document.querySelector('.p-rail');if(!r||!('IntersectionObserver' in window))return;var as=[].slice.call(r.querySelectorAll('a'));var map={};as.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){as.forEach(function(a){a.removeAttribute('aria-current');});var a=map[e.target.id];if(a)a.setAttribute('aria-current','true');}});},{rootMargin:'-20% 0px -70% 0px'});Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el);});})();</script>`;

function areaPage(ctx, slug) {
  const doc = ctx.content[slug];
  const ids = new Set();
  const file = AREAS[slug];
  const media = photoImg(file, { eager: true, cls: 'p-hero__img', alt: '' });
  const h = hero(ctx, doc, { media, ids, sketch: sketchImg('s-hat', 'p-sketch--hat'), mod: 'p-hero--area', notes: note(doc, 'look for the face with the hat', 'p-hero__note') });
  const card = doc.sections[1].blocks;
  const inner = card.length === 1 && card[0].t === 'card' ? card[0].blocks : card;
  const chunks = splitByH2(inner);
  // the closing "Visit" chunk goes into its own night band
  const last = chunks[chunks.length - 1];
  const isVisit = last && last.h2 && /^Visit /.test(stripTags(last.h2.html));
  const body = isVisit ? chunks.slice(0, -1) : chunks;
  const opts = { ids, tone: 'paper' };
  const article = body.map((ch, k) => {
    const { lead, groups } = h3Groups(ch.blocks);
    const priced = groups.length >= 2 && groups.every((g) => g.some((b) => b.t === 'ul' && (b.items || []).every((it) => typeof it === 'string' && /^\s*[\d.]+\s?g\s*\$/.test(stripTags(it)))));
    let inner2;
    if (priced) {
      // the last tier's trailing notes (after its price list) follow the cards; every block keeps its order
      const lastG = groups[groups.length - 1];
      const cut = lastG.map((b) => b.t).lastIndexOf('ul') + 1;
      const tail = lastG.slice(cut);
      const cardsG = groups.map((g, n) => (n === groups.length - 1 ? g.slice(0, cut) : g));
      inner2 = `${renderBlocks(lead, ctx, opts)}<div class="p-cards p-cards--price" data-count="${groups.length}">${cardsG.map((g, n) => `<article class="p-card p-card--price glass glass--milk glass--lift" data-reveal style="--i:${n}">${renderBlocks(g, ctx, opts)}</article>`).join('')}</div>${renderBlocks(tail, ctx, opts)}`;
    } else inner2 = renderBlocks(ch.blocks, ctx, opts);
    return `<section class="p-sec${k % 2 ? ' p-sec--alt' : ''}">${ch.h2 ? `<header class="p-sec__head">${kick(ch.kicker)}${renderBlock(ch.h2, ctx, opts)}${skLine('p-chunk__rule')}</header>` : ''}${inner2}</section>`;
  }).join('\n');
  const rail = railFrom(chunks);
  const main = band('paper', `<div class="wrap p-guide${rail ? '' : ' p-guide--norail'}">${rail ? `<aside class="p-guide__rail">${rail}</aside>` : ''}<div class="p-guide__article prose">${article}</div></div>`, { mod: 'p-band--guide' });
  const visit = isVisit ? band('night', `<div class="wrap p-visit"><div class="p-visit__media sk-tape" data-reveal>${photoImg('exterior-front.webp', { sizes: '(min-width: 1024px) 40vw, 100vw' })}</div><div class="glass glass--night p-visit__card" data-reveal style="--i:1">${renderBlock(last.h2, ctx, { ids, tone: 'night' })}${renderBlocks(last.blocks, ctx, { ids, tone: 'night' })}</div></div>`, { mod: 'p-band--visit' }) : '';
  return out(ctx, slug, h + main + visit + RAIL_JS, { bodyClass: 'p-type-area' });
}

function c101Page(ctx) {
  const slug = 'cannabis-101';
  const doc = ctx.content[slug];
  const ids = new Set();
  const h = hero(ctx, doc, { media: gimg('g-smoke', { alt: '', eager: true, cls: 'p-hero__img' }), ids, sketch: sketchImg('s-bud', 'p-sketch--hero'), mod: 'p-hero--guide' });
  const secs = doc.sections.slice(1);
  // in-page contents from the H2s (ids added for the anchors)
  const toc = [];
  const bands = secs.map((s, k) => {
    const h2 = s.blocks.find((b) => b.t === 'h2');
    const id = h2 ? 'c101-' + (k + 1) : null;
    if (h2) toc.push(`<li><a href="#${id}">${esc(stripTags(h2.html))}</a></li>`);
    const blocks = s.blocks.map((b) => (b === h2 ? { ...b, id } : b));
    const tone = k % 2 ? 'night' : 'paper';
    const imgB = blocks.find((b) => b.t === 'img');
    const opts = { ids, tone, imgStyle: 'plain' };
    if (imgB) {
      const rest = blocks.filter((b) => b !== imgB);
      return band(tone, `<div class="wrap p-split"><div class="p-split__text">${renderBlocks(rest, ctx, opts)}</div><div class="p-split__art">${renderBlock(imgB, ctx, opts)}</div></div>`, { mod: 'p-band--split' });
    }
    return band(tone, `<div class="wrap p-flow">${renderBlocks(blocks, ctx, opts)}</div>`, { mod: 'p-band--flow' });
  });
  const nav = `<nav class="p-toc wrap" aria-label="On this page"><ol class="p-toc__list">${toc.join('')}</ol></nav>`;
  return out(ctx, slug, h.replace('</section>', `${nav}</section>`) + bands.join('\n'), { bodyClass: 'p-type-guide' });
}

const FAQ_JS = `<script>(function(){var q=document.getElementById('p-faq-q');if(!q)return;var box=document.querySelector('.p-faq');var items=[].slice.call(box.querySelectorAll('.b-details'));var groups=[].slice.call(box.querySelectorAll('.p-faq__group'));var out=document.getElementById('p-faq-count');var total=items.length;var empty=document.getElementById('p-faq-empty');function run(){var v=q.value.trim().toLowerCase();var n=0;items.forEach(function(d){var hit=!v||d.textContent.toLowerCase().indexOf(v)>-1;d.hidden=!hit;if(hit)n++;});groups.forEach(function(g){var any=[].slice.call(g.querySelectorAll('.b-details')).some(function(d){return !d.hidden;});g.hidden=!!v&&!any;});out.textContent=v?(n+' of '+total+' questions match'):(total+' questions');empty.hidden=!(v&&n===0);}q.addEventListener('input',run);run();})();</script>`;

function faqPage(ctx) {
  const slug = 'faq';
  const doc = ctx.content[slug];
  const ids = new Set();
  const s0 = doc.sections[0].blocks;
  const navB = s0.find((b) => b.t === 'nav');
  const heroBlocks = s0.filter((b) => b !== navB);
  const h = hero(ctx, doc, { blocks: heroBlocks, media: gimg('g-smoke', { alt: '', eager: true, cls: 'p-hero__img' }), ids, sketch: sketchImg('s-hat', 'p-sketch--hat'), mod: 'p-hero--faq' });
  const card = doc.sections[1].blocks;
  const inner = card.length === 1 && card[0].t === 'card' ? card[0].blocks : card;
  const chunks = splitByH2(inner);
  const last = chunks[chunks.length - 1];
  const isContact = last && last.h2 && /^Contact$/.test(stripTags(last.h2.html).trim());
  const groups = (isContact ? chunks.slice(0, -1) : chunks).map((ch, k) => `<section class="p-faq__group">${ch.h2 ? `<header class="p-faq__head">${renderBlock(ch.h2, ctx, { ids })}</header>` : ''}${renderBlocks(ch.blocks, ctx, { ids, tone: 'paper' })}</section>`).join('\n');
  const tools = `<div class="p-faq__tools glass glass--milk"><label class="p-faq__label" for="p-faq-q">Search the questions</label><input class="p-faq__input" id="p-faq-q" type="search" autocomplete="off" spellcheck="false"><p class="p-faq__count" id="p-faq-count" aria-live="polite"></p></div>`;
  const rail = `<aside class="p-guide__rail p-faq__rail">${tools}${navB ? `<div class="p-rail p-rail--faq glass glass--milk">${renderBlock(navB, ctx, { ids })}</div>` : ''}</aside>`;
  const main = band('paper', `<div class="wrap p-guide p-faq">${rail}<div class="p-guide__article">${groups}<p class="p-faq__empty" id="p-faq-empty" hidden>No questions match that search. Try another word.</p></div></div>`, { mod: 'p-band--guide' });
  const contact = isContact ? band('night', `<div class="wrap p-visit p-visit--faq"><div class="glass glass--night p-visit__card" data-reveal>${renderBlock(last.h2, ctx, { ids })}${renderBlocks(last.blocks, ctx, { ids, tone: 'night' })}</div><div class="p-visit__media sk-tape" data-reveal style="--i:1">${photoImg('sign.webp', { sizes: '(min-width: 1024px) 40vw, 100vw' })}</div></div>`, { mod: 'p-band--visit' }) : '';
  return out(ctx, slug, h + main + contact + FAQ_JS, { bodyClass: 'p-type-faq' });
}

function companyPage(ctx) {
  const slug = 'company';
  const doc = ctx.content[slug];
  const ids = new Set();
  const [s0, s1, film, s3, s4, s5] = doc.sections;
  const h = hero(ctx, doc, { media: photoImg('exterior-front.webp', { eager: true, cls: 'p-hero__img', alt: '' }), ids, mod: 'p-hero--company', sketch: `<span class="p-dealer" aria-hidden="true">${img({ src: '/assets/brand/dealer-cut.png', alt: '' }, { sizes: '220px' })}</span>` });
  const q = s1.blocks.find((b) => b.t === 'quote');
  const s1rest = s1.blocks.filter((b) => b !== q);
  const story = band('paper', `<div class="wrap p-flow p-flow--story">${renderBlocks(s1rest, ctx, { ids, tone: 'paper' })}</div>`, { mod: 'p-band--story' });
  const quote = q ? band('night', `<div class="wrap p-statement">${renderBlock(q, ctx, { ids })}</div>`, { mod: 'p-band--statement' }) : '';
  const fb = film.blocks;
  const emb = fb.find((b) => b.t === 'embed');
  const grid = fb.find((b) => b.t === 'grid');
  const textB = fb.filter((b) => b !== emb && b !== grid);
  const filmBand = band('night', `<div class="wrap p-film"><div class="p-film__text">${renderBlocks(textB, ctx, { ids, tone: 'night' })}</div><div class="p-film__player">${emb ? renderBlock(emb, ctx, { ids }) : ''}</div>${grid ? `<div class="p-film__parts">${renderBlock(grid, ctx, { ids, tone: 'night' })}</div>` : ''}</div>`, { id: film.id || 'film', mod: 'p-band--film' });
  const cards3 = band('paper', `<div class="wrap p-flow">${renderBlocks(s3.blocks, ctx, { ids, tone: 'paper', cardCls: 'glass glass--milk glass--lift' })}</div>`, { mod: 'p-band--cards' });
  const cards2 = band('night', `<div class="wrap p-flow">${renderBlocks(s4.blocks, ctx, { ids, tone: 'night', cardCls: 'glass glass--night glass--lift' })}</div>`, { mod: 'p-band--cards p-band--stores' });
  const imgB = s5.blocks.find((b) => b.t === 'img');
  const s5rest = s5.blocks.filter((b) => b !== imgB);
  const win = band('paper', `<div class="wrap p-split p-split--photo"><div class="p-split__art">${imgB ? renderBlock(imgB, ctx, { ids, imgStyle: 'tape' }) : ''}</div><div class="p-split__text">${renderBlocks(s5rest, ctx, { ids, tone: 'paper' })}</div></div>`, { mod: 'p-band--split' });
  return out(ctx, slug, h + story + quote + filmBand + cards3 + cards2 + win, { bodyClass: 'p-type-company' });
}

function buildPage(ctx) {
  const slug = 'build';
  const doc = ctx.content[slug];
  const ids = new Set();
  const [s0, s1, s2] = doc.sections;
  const h = hero(ctx, doc, { media: photoImg('exterior-front-after.webp', { eager: true, cls: 'p-hero__img', alt: '' }), ids, mod: 'p-hero--build', sketch: sketchImg('s-jar', 'p-sketch--hero') });
  const status = band('night', `<div class="wrap p-flow">${renderBlocks(s1.blocks, ctx, { ids, tone: 'night', cardCls: 'glass glass--night glass--lift p-status' })}</div>`, { mod: 'p-band--status' });
  const chunks = splitByH2(s2.blocks);
  const bands = chunks.map((ch, k) => {
    const tone = k % 2 ? 'night' : 'paper';
    const opts = { ids, tone };
    return band(tone, `<div class="wrap p-book"><header class="p-book__head">${kick(ch.kicker)}${ch.h2 ? renderBlock(ch.h2, ctx, opts) : ''}${skLine('p-chunk__rule')}</header><div class="p-book__body">${renderBlocks(ch.blocks, ctx, opts)}</div></div>`, { mod: 'p-band--book' });
  }).join('\n');
  return out(ctx, slug, h + status + bands, { bodyClass: 'p-type-build' });
}

function contactPage(ctx) {
  const slug = 'contact';
  const doc = ctx.content[slug];
  const ids = new Set();
  const h = hero(ctx, doc, { media: photoImg('sign.webp', { eager: true, cls: 'p-hero__img', alt: '' }), ids, mod: 'p-hero--contact p-hero--short', sketch: sketchImg('s-hat', 'p-sketch--hat') });
  const body = band('night', `<div class="wrap p-flow p-contact">${renderBlocks(doc.sections[1].blocks, ctx, { ids, tone: 'night', cardCls: 'glass glass--night glass--lift p-contact__card', linkStyle: 'buttons' })}</div>`, { mod: 'p-band--contact' });
  return out(ctx, slug, h + body, { bodyClass: 'p-type-contact' });
}

function jobsPage(ctx) {
  const slug = 'jobs';
  const doc = ctx.content[slug];
  const ids = new Set();
  const [s0, roles, s2, s3] = doc.sections;
  const h = hero(ctx, doc, { media: photoImg('interior-service-doors.webp', { eager: true, cls: 'p-hero__img', alt: '' }), ids, mod: 'p-hero--jobs', sketch: sketchImg('s-hat', 'p-sketch--hat') });
  const r = band('paper', `<div class="wrap p-flow p-roles">${renderBlocks(roles.blocks, ctx, { ids, tone: 'paper', cardCls: 'glass glass--milk p-role' })}</div>`, { id: roles.id || 'roles', mod: 'p-band--roles' });
  const traits = band('night', `<div class="wrap p-flow">${renderBlocks(s2.blocks, ctx, { ids, tone: 'night', cardCls: 'glass glass--night glass--lift p-trait' })}</div>`, { mod: 'p-band--cards' });
  const imgB = s3.blocks.find((b) => b.t === 'img');
  const rest = s3.blocks.filter((b) => b !== imgB);
  const slow = band('paper', `<div class="wrap p-split p-split--photo"><div class="p-split__art">${imgB ? renderBlock(imgB, ctx, { ids, imgStyle: 'tape' }) : ''}</div><div class="p-split__text">${renderBlocks(rest, ctx, { ids, tone: 'paper' })}</div></div>`, { mod: 'p-band--split' });
  return out(ctx, slug, h + r + traits + slow, { bodyClass: 'p-type-jobs' });
}

function privacyPage(ctx) {
  const slug = 'privacy';
  const doc = ctx.content[slug];
  const ids = new Set();
  const h = hero(ctx, doc, { ids, mod: 'p-hero--calm p-hero--short' });
  const card = doc.sections[1].blocks;
  const inner = card.length === 1 && card[0].t === 'card' ? card[0].blocks : card;
  const body = band('paper', `<div class="wrap wrap--narrow prose p-prose">${renderBlocks(inner, ctx, { ids, tone: 'paper', reveal: false })}</div>`, { mod: 'p-band--prose' });
  return out(ctx, slug, h + body, { bodyClass: 'p-type-privacy' });
}

function shopPage(ctx) {
  const slug = 'shop';
  const doc = ctx.content[slug];
  const ids = new Set();
  const h = hero(ctx, doc, { media: gimg('g-deli-jars', { alt: '', eager: true, cls: 'p-hero__img' }), ids, mod: 'p-hero--shop', sketch: sketchImg('s-jar', 'p-sketch--hero') });
  const body = band('paper', `<div class="wrap p-flow p-ways">${renderBlocks(doc.sections[1].blocks, ctx, { ids, tone: 'paper', cardCls: 'glass glass--milk glass--lift p-way', h2Rule: true })}</div>`, { mod: 'p-band--cards' });
  return out(ctx, slug, h + body, { bodyClass: 'p-type-shop' });
}

function notFound(ctx) {
  const main = `<section class="band band--night p-hero p-hero--404">
<div class="wrap p-404">
<div class="glass glass--night p-hero__panel">${skCorners('p-hero__marks')}
<p class="kicker b-kicker">404</p>
<h1 class="b-h b-h1">This page is not here.</h1>
<p class="b-p">The link may be old, or the page may have moved.</p>
<p class="b-links"><a class="btn btn--gold b-btn" href="/"><span>Back to the home page</span></a> <a class="btn btn--glass b-btn"${linkAttrs(MENU)}><span>View the menu</span></a></p>
</div>
<div class="p-404__art">${sketchImg('s-hat', 'p-sketch--404')}</div>
</div>
</section>`;
  return {
    path: '/404.html',
    html: page({ ctx, path: '/404.html', title: 'Page not found | My Dealer', description: 'This page could not be found on the My Dealer website.', canonical: '', og: {}, jsonld: [], bodyClass: 'p-page p-page--404', main, crumbs: [['/', 'Home'], ['/404.html', 'Page not found']] }),
  };
}

export async function render(ctx) {
  const outp = [];
  for (const slug of Object.keys(CATS)) outp.push(categoryPage(ctx, slug));
  for (const slug of Object.keys(AREAS)) outp.push(areaPage(ctx, slug));
  outp.push(c101Page(ctx), faqPage(ctx), companyPage(ctx), buildPage(ctx), contactPage(ctx), jobsPage(ctx), privacyPage(ctx), shopPage(ctx), notFound(ctx));
  return outp;
}
