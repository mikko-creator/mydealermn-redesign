// hubs lane: dispensaries, location, deals, rewards, guides, laws, blog hubs. The new pages of the adopted architecture: the Bayport LOCATION template,
// deals, rewards, guides, laws by state, blog hubs. Every fact and sentence comes from ctx.site (site.json, copied
// verbatim), ctx.ia or captured blocks in ctx.content (rendered with renderBlocks, so the words stay exact). New words
// are neutral glue only: labels, one-line hub intros, button text. Own classes are prefixed r-.
import { esc, escA, attrs, href, linkAttrs, img, gimg, stripTags } from './util.mjs';
import { page } from './shell.mjs';
import { renderBlocks } from './blocks.mjs';

const ORIGIN = 'https://mydealermn.com';
const OG_IMAGE = 'https://mydealermn.com/og-card.jpg';
const OG_IMAGE_ALT = 'My Dealer logo, the cartoon head with the hat and glasses, Bayport Minnesota';

// Client photos (alt: the registry in src/content/images.json when present, else the live site's own alt).
const PH = {
  front: { src: '/assets/photos/exterior-front.webp', alt: 'My Dealer storefront at 243 3rd Street North, with the cartoon head and name on the brick' },
  sign: { src: '/assets/photos/sign.webp', alt: 'Illuminated My Dealer sign on the Bayport storefront' },
  north: { src: '/assets/photos/exterior-from-north.webp', alt: 'My Dealer from the north, on the left next to New Edge Exteriors and the Legion' },
  south: { src: '/assets/photos/exterior-from-south.webp', alt: 'My Dealer from the south, on the right next to the post office' },
  parking: { src: '/assets/photos/parking-after.webp', alt: 'Paved customer parking' },
  floor: { src: '/assets/photos/interior-service-doors.webp', alt: 'Finished retail floor' },
  windows: { src: '/assets/photos/interior-security-windows.webp', alt: 'Security checkpoint windows between the lobby and the sales floor' },
  signUp: { src: '/assets/photos/exterior-front-after.webp', alt: 'The sign is up' },
  stick: { src: '/assets/brand/stick-figure.png', alt: 'My Dealer stick figure in a fedora and yellow glasses' },
  cut: { src: '/assets/brand/dealer-cut.png', alt: '' },
};

// ---------- sketch layer (inline SVG strokes; the shared #sk-rough filter is applied by .r-sk in this lane's stylesheet) ----------
const ICONS = {
  id: 'M7 12h34a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3zM19.5 21.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 1 1 9 0zM9 31.5c1.6-3.4 3.8-5 6-5s4.4 1.6 6 5M26 20h13M26 25.5h13M26 31h8',
  atm: 'M8 5h32v26H8zM13 10h22v10H13zM14 25.5h20M16 31v12h16V31M20.5 37h7',
  cashless: 'M4 15h30v20H4zM4 21.5h30M9 29h9M38.5 19c2.4 2.6 2.4 9.4 0 12M43 15.5c4 4.6 4 14.4 0 19',
  bag: 'M10 17h28l-2.2 25H12.2zM17 17v-3.5a7 7 0 0 1 14 0V17M18 30l4.5 4.5L31 25',
  lot: 'M9 7h30a2 2 0 0 1 2 2v30a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM19 35V14h7.5a6.2 6.2 0 0 1 0 12.4H19',
  street: 'M5 32v-7l4.5-9.5h29L43 25v7zM5 32h38M12 32v4.5M36 32v4.5M13 24h22M2 42h44M10 42l-2 4M24 42v4M38 42l2 4',
  doors: 'M5 9h15v31H5zM16 24.5v3M28 9h15v31H28zM32 24.5v3M2 40h44',
  star: 'M24 5l5.6 12.1 13.2 1.5-9.8 9 2.7 13.1L24 34l-11.7 6.7 2.7-13.1-9.8-9 13.2-1.5z',
  pct: 'M24 4a20 20 0 1 1 0 40a20 20 0 1 1 0-40zM15 33l18-18M19 17.5a3 3 0 1 1-6 0a3 3 0 1 1 6 0zM35 30.5a3 3 0 1 1-6 0a3 3 0 1 1 6 0z',
  van: 'M4 14h25v19H4zM29 20h9l6 7v6H29zM8 37.5h6M33 37.5h6M5 43L43 5',
  clock: 'M24 5a19 19 0 1 1 0 38a19 19 0 1 1 0-38zM24 13v11l7.5 4.5',
  pin: 'M24 44s14-12.6 14-24a14 14 0 0 0-28 0c0 11.4 14 24 14 24zM29 20a5 5 0 1 1-10 0a5 5 0 1 1 10 0z',
  phone: 'M15 6l5.5 1.2 2.8 8-4 3.2c2 5 6 9 11.2 11.3l3.3-4 7.8 2.9 1.2 5.6c.2 3.3-2.3 5.8-5.6 5.6C21 38.9 9.4 27.4 8.6 11.6 8.4 8.3 11.4 5.8 15 6z',
  mail: 'M5 12h38v25H5zM5 12l19 14.5L43 12',
  doc: 'M11 4h19l8 8v32H11zM30 4v8h8M17 19h15M17 25h15M17 31h8M31 35.5a4 4 0 1 1-8 0a4 4 0 1 1 8 0z',
  no: 'M24 5a19 19 0 1 1 0 38a19 19 0 1 1 0-38zM10.6 10.6l26.8 26.8',
  scale: 'M24 7v33M14 41h20M7 14h34M7 14l-5 12h10zM41 14l-5 12h10zM2 26a5 3 0 0 0 10 0M36 26a5 3 0 0 0 10 0',
  cal: 'M7 10h34v31H7zM7 18h34M15 5v9M33 5v9M14 26h4M22 26h4M30 26h4M14 33h4M22 33h4',
  store: 'M6 19l3-11h30l3 11zM6 19c0 3 2.6 5 6 5s6-2 6-5c0 3 2.6 5 6 5s6-2 6-5c0 3 2.6 5 6 5s6-2 6-5M9 24v18h30V24M20 42V31h8v11',
  route: 'M10 40c6-1 9-6 7-11s1-9 7-10 10-5 8-11M8 36.5a3.5 3.5 0 1 1 0 7M38 4.5l3.5 3.5L38 11.5',
  leaf: 'M24 44V22M24 22C14 20 8 12 8 4c9 1 15 7 16 18zM24 22c10-2 16-10 16-18-9 1-15 7-16 18zM24 30c-6 0-11 3-14 7M24 30c6 0 11 3 14 7',
};
// icon(name, cls, draw): draw = true draws the icon on when it scrolls in (FOUNDATION's [data-draw]); icons near the
// first screen stay static so they never sit undrawn below the observer's margin.
const icon = (name, cls = '', draw = false) => `<svg class="r-ico r-sk ${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"${draw ? ' data-draw' : ''}><path class="sk-p" pathLength="1" d="${ICONS[name]}"/></svg>`;
const arrow = (cls = '') => `<svg class="r-arrow r-sk ${cls}" viewBox="0 0 44 24" aria-hidden="true" focusable="false"><path class="sk-p" pathLength="1" d="M3 13c9-1.5 22-2 37-1.2M31 4.5l9 7.5-9 7"/></svg>`;
const underline = () => `<svg class="r-ul__svg r-sk" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><path class="sk-p" pathLength="1" d="M3 10c32-6 70-5 104-3.5 32 1.5 62 1 90-3"/></svg>`;
const ul = (word) => `<span class="r-ul">${word}${underline()}</span>`;
// cards: the underline draws on hover / focus (this lane's stylesheet), not on reveal
const ulHover = (text) => `<span class="r-ul r-ul--hover">${text}<svg class="r-ul__svg r-sk" viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="sk-p" pathLength="1" d="M3 10c32-6 70-5 104-3.5 32 1.5 62 1 90-3"/></svg></span>`;
const regMarks = () => `<svg class="r-reg r-sk" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><path class="sk-p" pathLength="1" vector-effect="non-scaling-stroke" d="M0 9V0h9M91 0h9v9M100 91v9h-9M9 100H0v-9"/></svg>`;
const circleMark = (cls = '') => `<svg class="r-circle r-sk ${cls}" viewBox="0 0 220 140" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><path class="sk-p" pathLength="1" d="M128 12C70 4 14 26 10 66c-4 42 58 66 118 62 54-4 88-30 82-62C204 30 160 10 104 14"/></svg>`;
const couponBorder = () => `<svg class="r-coupon__edge r-sk" viewBox="0 0 400 240" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="sk-p" pathLength="1" vector-effect="non-scaling-stroke" d="M14 10c120-3 250-2 372 1 3 70 3 150 1 219-125 3-250 2-373-1-3-72-3-146 0-219z"/></svg>`;

// ---------- small helpers ----------
const ext = (u, label, cls = 'btn btn--gold') => `<a class="${cls}"${linkAttrs(u)}>${esc(label)}<span class="r-ext" aria-hidden="true">&#8599;</span><span class="r-sr"> (opens in a new tab)</span></a>`;
const int = (u, label, cls = 'btn btn--ghost') => `<a class="${cls}"${linkAttrs(u)}>${esc(label)}</a>`;
// Escape a verbatim site.json sentence and turn the bare live-menu URL inside it into a link (same words).
const linkify = (s) => esc(s).replace(/https:\/\/mydealermn\.com\/bayport/g, (u) => `<a${linkAttrs(u)}>${u}</a>`);
const sec = (id) => `r-${id}`;

function meta(path, title, description) {
  const canonical = ORIGIN + path;
  return {
    path, title, description, canonical,
    og: { 'og:title': title, 'og:description': description, 'og:type': 'website', 'og:site_name': 'My Dealer', 'og:locale': 'en_US', 'og:url': canonical, 'og:image': OG_IMAGE, 'og:image:alt': OG_IMAGE_ALT },
  };
}

// The live menu is external (D4): captured links to "/bayport..." point at mydealermn.com. Only href values change.
function liveMenuLinks(x) {
  if (Array.isArray(x)) return x.map(liveMenuLinks);
  if (x && typeof x === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(x)) o[k] = k === 'href' && typeof v === 'string' && /^\/bayport(\/|$)/.test(v) ? ORIGIN + v : liveMenuLinks(v);
    return o;
  }
  if (typeof x === 'string') return x.replace(/href="\/bayport(\/[^"]*)?"/g, (m, rest) => `href="${ORIGIN}/bayport${rest || ''}"`);
  return x;
}

function walkBlocks(blocks, fn) {
  for (const b of blocks || []) {
    fn(b);
    if (b.blocks) walkBlocks(b.blocks, fn);
    if (b.items) for (const it of b.items) if (it && typeof it === 'object' && it.blocks) walkBlocks(it.blocks, fn);
  }
}

const missing = [];
// Captured FAQ <details> blocks, picked by their summary text (verbatim).
function faqBlocks(ctx, summaries) {
  const all = [];
  for (const s of ctx.content.faq?.sections || []) walkBlocks(s.blocks, (b) => { if (b.t === 'details') all.push(b); });
  const out = [];
  for (const q of summaries) {
    const d = all.find((b) => stripTags(b.summary) === q);
    if (d) out.push(liveMenuLinks(d)); else missing.push('faq: ' + q);
  }
  return out;
}

// A captured run of blocks on a page: from the heading with this id up to (not including) the next heading of the same level.
function sectionBlocks(ctx, slug, headingId) {
  const doc = ctx.content[slug];
  for (const s of doc?.sections || []) {
    let list = null;
    walkBlocks(s.blocks, (b) => { if (!list && b.blocks && b.blocks.some((x) => x.id === headingId)) list = b.blocks; });
    if (!list && s.blocks.some((x) => x.id === headingId)) list = s.blocks;
    if (!list) continue;
    const i = list.findIndex((x) => x.id === headingId);
    const lvl = list[i].t;
    const out = [list[i]];
    for (let j = i + 1; j < list.length && list[j].t !== lvl && !(/^h[1-2]$/.test(list[j].t) && list[j].t <= lvl); j++) out.push(list[j]);
    return liveMenuLinks(out);
  }
  missing.push(slug + '#' + headingId);
  return [];
}

function h1Of(doc) {
  let h = '';
  for (const s of doc?.sections || []) walkBlocks(s.blocks, (b) => { if (!h && b.t === 'h1') h = b.html; });
  return stripTags(h);
}

// ---------- shared components ----------
function hero({ kicker, title, lede, actions = '', bg = '', side = '', cls = '', after = '' }) {
  return `<section class="band band--night band--over r-hero ${cls}">
  <div class="band__clip" aria-hidden="true">${bg}<span class="r-glow r-glow--gold"></span><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap r-hero__grid">
    <div class="glass glass--night r-hero__panel" data-reveal>
      ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
      <h1 class="display r-hero__title">${title}</h1>
      ${lede ? `<p class="lede r-hero__lede">${lede}</p>` : ''}
      ${actions ? `<div class="btn-row r-hero__actions">${actions}</div>` : ''}
    </div>
    ${side ? `<div class="r-hero__side">${side}</div>` : ''}
  </div>
  ${after}
</section>`;
}

const cutout = (cls = '') => `<div class="protrude r-cut ${cls}" aria-hidden="true" data-depth="-0.06">${img(PH.cut, { alt: '', sizes: '(max-width: 767px) 150px, 220px' })}</div>`;

function head2(kicker, title, intro = '', { center = false, id = '' } = {}) {
  return `<header class="band__head${center ? ' band__head--center' : ''}" data-reveal>
    ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
    <h2 class="display r-h2"${attrs({ id })}>${title}</h2>
    ${intro ? `<p class="lede">${intro}</p>` : ''}
  </header>`;
}

function storeCard(ctx, { level = 2, i = 0 } = {}) {
  const st = ctx.site.store;
  const a = st.address;
  return `<article class="glass glass--night glass--lift r-store" data-reveal style="--i:${i}">
    <div class="r-store__photo">${img(PH.front, { sizes: '(min-width: 960px) 520px, (max-width: 767px) 88vw, 100vw', cls: 'r-store__img' })}${regMarks()}</div>
    <div class="r-store__body">
      <p class="kicker">${esc(st.state)}</p>
      <h${level} class="r-store__name"><a${linkAttrs(st.path)}>${esc(st.name)}</a></h${level}>
      <p class="r-store__type">Licensed adult-use cannabis dispensary</p>
      <ul class="r-facts">
        <li>${icon('pin')}<span>${esc(a.street)}, ${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}</span></li>
        <li>${icon('clock')}<span>${esc(st.hoursShort)}</span></li>
        <li>${icon('phone')}<a href="tel:${escA(st.tel)}">${esc(st.phone)}</a></li>
      </ul>
      <div class="btn-row">
        ${int(st.path, 'Store details', 'btn btn--gold')}
        ${ext(st.menuUrl, ctx.site.headerCta[1], 'btn btn--glass')}
        ${ext(st.directionsUrl, 'Get directions', 'btn btn--ghost')}
      </div>
    </div>
  </article>`;
}

function nextCard(ctx, { i = 0, full = false } = {}) {
  const n = ctx.site.next;
  const note = ctx.ia.nav.find((x) => x.label === 'Dispensaries')?.mega?.[0]?.note || '';
  return `<aside class="r-next" data-reveal style="--i:${i}" aria-label="${escA(n.name)}">
    <svg class="r-next__edge r-sk" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="sk-p" pathLength="1" vector-effect="non-scaling-stroke" d="M16 8c124-4 250-4 370 2 4 94 4 186 0 280-122 4-246 4-372-1-4-94-4-188 2-281z"/></svg>
    <p class="sk-note r-next__note">${esc(n.list[1])}</p>
    <h3 class="r-next__name">${icon('store')}${esc(n.name)}</h3>
    <p>${esc(n.text)}</p>
    ${full ? `<ul class="r-next__list">${n.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : note ? `<p class="r-next__small">${esc(note)}</p>` : ''}
  </aside>`;
}

function areaCards(ctx, areas, { level = 3 } = {}) {
  return areas.map((a, i) => `<a class="r-area glass glass--lift" data-reveal style="--i:${i % 6}"${linkAttrs(a.path)}>
      <span class="r-area__state">${esc(a.state)}</span>
      <h${level} class="r-area__name">${ulHover(esc(a.name))}</h${level}>
      <span class="r-area__blurb">${esc(a.blurb)}</span>
      ${arrow('r-area__go')}
    </a>`).join('\n');
}

function coupon(d, i) {
  return `<article class="glass glass--lift r-coupon" data-reveal style="--i:${i}">
    ${couponBorder()}
    <p class="r-coupon__value">${esc(d.value)}</p>
    <h3 class="r-coupon__title">${esc(d.title)}</h3>
    <p class="r-coupon__text">${esc(d.text)}</p>
    <span class="r-coupon__punch" aria-hidden="true"></span>
  </article>`;
}

function mark3(ctx, cls = '') {
  // the drawn "3%" mark: My Dealer's own figure (site.json rewards.points), circled by hand
  return `<div class="r-mark3 ${cls}" aria-hidden="true"><span class="r-mark3__num">3%</span>${circleMark('r-mark3__ring')}<span class="sk-note r-mark3__note">${esc(ctx.site.rewards.points)}</span></div>`;
}

function faqList(ctx, summaries, cls = '') {
  const blocks = faqBlocks(ctx, summaries);
  return `<div class="r-faq ${cls}">${renderBlocks(blocks, ctx, { headingShift: 1 })}</div>`;
}

function fromSource(label, path) {
  return `<p class="r-source"><a${linkAttrs(path)}>${esc(label)}</a></p>`;
}

const crumb = { home: ['/', 'Home'], disp: ['/dispensaries/', 'Dispensaries'], mn: ['/dispensaries/minnesota/', 'Minnesota'] };

// ---------- pages ----------
function dispensariesHub(ctx) {
  const S = ctx.site;
  const m = meta('/dispensaries/', 'Dispensaries Near You | My Dealer', `${S.store.name}, ${S.store.address.street}, ${S.store.address.city}, ${S.store.address.region} ${S.store.address.postal}. ${S.store.hoursShort} ${S.store.age}`);
  const main = `
${hero({
    kicker: 'All locations',
    title: `Dispensaries <em>near you</em>`,
    lede: 'My Dealer stores and the areas they serve, by state.',
    actions: `${int(S.store.path, S.store.name, 'btn btn--gold')}${ext(S.store.menuUrl, S.headerCta[1], 'btn btn--glass')}`,
    bg: img(PH.front, { alt: '', eager: true, sizes: '100vw', cls: 'r-hero__bg' }),
    after: cutout('r-cut--hero'),
  })}
<section class="band band--paper r-states" aria-labelledby="${sec('mn')}">
  <div class="wrap">
    ${head2('Minnesota', `<a${linkAttrs('/dispensaries/minnesota/')} class="r-h2link">Minnesota ${ul('dispensaries')}</a>`, '', { id: sec('mn') })}
    <div class="r-store-row">
      ${storeCard(ctx, { level: 3 })}
      ${nextCard(ctx, { i: 1 })}
    </div>
  </div>
</section>
<section class="band band--night r-served" aria-labelledby="${sec('served')}">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span></div>
  <div class="wrap">
    ${head2('Areas we serve', 'Shopping from <em>nearby</em>', esc(S.servedAreas), { id: sec('served') })}
    <div class="r-area-grid">${areaCards(ctx, S.areas)}</div>
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, ['/dispensaries/', 'Dispensaries']], bodyClass: 'r-page r-page--hub', main };
}

function minnesotaHub(ctx) {
  const S = ctx.site;
  const m = meta('/dispensaries/minnesota/', 'Minnesota Dispensaries | My Dealer', `${S.store.name}: ${S.store.type} ${S.store.hoursShort}`);
  const mn = S.areas.filter((a) => a.state === 'MN');
  const wi = S.areas.filter((a) => a.state === 'WI');
  const main = `
${hero({
    kicker: S.store.state,
    title: `Minnesota <em>dispensaries</em>`,
    lede: esc(S.store.type),
    actions: `${int(S.store.path, 'Store details', 'btn btn--gold')}${int('/dispensaries/minnesota/deals/', 'Deals', 'btn btn--glass')}`,
    bg: img(PH.signUp, { alt: '', eager: true, sizes: '100vw', cls: 'r-hero__bg' }),
    after: cutout('r-cut--hero'),
  })}
<section class="band band--paper r-states" aria-labelledby="${sec('stores')}">
  <div class="wrap">
    ${head2('Stores', `My Dealer in ${ul('Minnesota')}`, '', { id: sec('stores') })}
    <div class="r-store-row">
      ${storeCard(ctx, { level: 3 })}
      ${nextCard(ctx, { i: 1, full: true })}
    </div>
  </div>
</section>
<section class="band band--night r-served" aria-labelledby="${sec('served')}">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap">
    ${head2('Areas we serve', 'Shopping from <em>nearby</em>', esc(S.servedAreas), { id: sec('served') })}
    <h3 class="r-group">${esc(S.store.state)}</h3>
    <div class="r-area-grid">${areaCards(ctx, mn, { level: 4 })}</div>
    <h3 class="r-group">Wisconsin shoppers</h3>
    <div class="r-area-grid">${areaCards(ctx, wi, { level: 4 })}</div>
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, crumb.disp, ['/dispensaries/minnesota/', 'Minnesota']], bodyClass: 'r-page r-page--hub', main };
}

function locationPage(ctx) {
  const S = ctx.site;
  const st = S.store;
  const a = st.address;
  const path = st.path;
  const m = meta(path, 'My Dealer Bayport | Licensed Cannabis Dispensary in Bayport, MN', `${st.name}, ${a.street}, ${a.city}, ${a.region} ${a.postal}. ${st.hoursShort} ${st.age} ${st.license}.`);
  const contact = ctx.content.contact;
  let embed = null;
  for (const s of contact?.sections || []) walkBlocks(s.blocks, (b) => { if (!embed && b.t === 'embed' && /google\.com\/maps/.test(b.src)) embed = b; });
  if (!embed) missing.push('contact: map embed');
  const landmarkNote = 'look for the face with the hat';
  if (!st.landmarks.includes(landmarkNote)) missing.push('landmarks note');

  const amenities = [
    ['id', 'Valid ID required'], ['atm', 'ATM on site'], ['cashless', 'Cashless ATM'], ['bag', 'Order ahead for pickup'],
    ['lot', 'Parking lot behind the building'], ['street', 'Street parking out front'], ['doors', 'Entrances front and back'],
    ['star', 'Veterans discount'], ['pct', S.rewards.points], ['van', 'No delivery yet'],
  ];
  const visiting = [
    ['id', 'Age and ID', [st.age]],
    ['cashless', 'Payment', [st.payment, st.atm]],
    ['lot', 'Parking', [st.parking]],
    ['bag', 'Order ahead', [st.orderAhead]],
    ['no', 'Consumption', [st.consumption]],
    ['scale', 'Purchase limits', [st.limits]],
  ];
  const more = [
    ['Are you a chain?', st.chain],
    ['What products do you have?', st.sells],
    ['Do you deliver?', st.delivery],
    ['Do you have an app?', st.app],
    ['Do you sell medical cannabis?', st.medical],
  ];
  const nearby = S.areas;

  const main = `
<section class="band band--night band--over r-loc-hero" aria-labelledby="r-loc-h1">
  <div class="band__clip" aria-hidden="true">
    <div class="r-loc-hero__photo" data-depth="0.12">${img(PH.sign, { alt: '', eager: true, sizes: '100vw' })}</div>
    <span class="r-loc-hero__shade"></span>
  </div>
  <div class="wrap r-loc-hero__grid">
    <div class="glass glass--night r-loc-card" data-reveal>
      <p class="kicker">${esc(a.regionName)} · ${esc(a.city)}</p>
      <h1 class="display r-loc-card__title" id="r-loc-h1">My Dealer <em>Bayport</em></h1>
      <p class="r-loc-card__type">Licensed adult-use cannabis dispensary</p>
      <div class="btn-row">
        ${ext(st.menuUrl, S.headerCta[1], 'btn btn--gold')}
        ${ext(st.directionsUrl, 'Get directions', 'btn btn--glass')}
        <a class="btn btn--ghost" href="#r-details">Store details</a>
      </div>
      <ul class="r-facts r-facts--lg">
        <li>${icon('pin')}<a${linkAttrs(st.directionsUrl)}>${esc(a.street)}, ${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}<span class="r-sr"> (opens in a new tab)</span></a></li>
        <li>${icon('clock')}<span>${esc(st.hoursShort)}</span></li>
        <li>${icon('phone')}<a href="tel:${escA(st.tel)}">${esc(st.phone)}</a></li>
      </ul>
      <p class="r-loc-card__lic">${esc(st.license)}</p>
    </div>
  </div>
  <figure class="protrude r-loc-tape" data-depth="-0.08">
    <span class="r-loc-tape__photo sk-tape">${img(PH.front, { sizes: '(min-width: 960px) 420px, (max-width: 767px) 40vw, 60vw' })}</span>
    <figcaption class="sk-note r-loc-tape__note">${esc(landmarkNote)}${arrow('r-loc-tape__arrow')}</figcaption>
  </figure>
</section>

<section class="band band--paper band--tight r-strip" aria-labelledby="r-rewards-strip">
  <div class="wrap r-strip__grid">
    ${mark3(ctx, 'r-mark3--strip')}
    <div class="r-strip__copy" data-reveal>
      <h2 class="r-strip__title" id="r-rewards-strip">Rewards</h2>
      <p>${esc(S.rewards.text)}</p>
    </div>
    <div class="btn-row r-strip__cta" data-reveal style="--i:1">${int('/rewards/', 'How rewards work', 'btn btn--gold')}${int('/dispensaries/minnesota/deals/', 'Deals', 'btn btn--ghost')}</div>
  </div>
</section>

<section class="band band--night r-details" id="r-details" aria-labelledby="r-details-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap">
    ${head2('Store details', `${esc(st.name)} Dispensary ${ul('Details')}`, '', { id: 'r-details-h' })}
    <div class="r-details__grid">
      <div class="glass glass--night r-details__card" data-reveal>
        <dl class="r-dl">
          <div>${icon('pin')}<dt>Address</dt><dd>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}</dd></div>
          <div>${icon('clock')}<dt>Hours</dt><dd>${esc(st.hours)}</dd></div>
          <div>${icon('phone')}<dt>Phone</dt><dd><a href="tel:${escA(st.tel)}">${esc(st.phone)}</a></dd></div>
          <div>${icon('mail')}<dt>Email</dt><dd><a href="mailto:${escA(st.email)}">${esc(st.email)}</a></dd></div>
          <div>${icon('doc')}<dt>License</dt><dd>${esc(st.licenseLine)}</dd></div>
        </dl>
        <div class="btn-row">
          ${ext(st.directionsUrl, 'Get directions', 'btn btn--gold btn--sm')}
          ${ext(st.googleUrl, 'Find us on Google', 'btn btn--glass btn--sm')}
        </div>
      </div>
      <div class="r-map" data-reveal style="--i:1">
        ${embed ? `<iframe${attrs({ src: embed.src, title: embed.title, loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allowfullscreen: true })}></iframe>` : ''}
        ${regMarks()}
      </div>
    </div>
    <div class="r-routes">
      ${[[st.fromNorth, PH.north], [st.fromSouth, PH.south]].map(([r, ph], i) => `<article class="glass glass--night r-route" data-reveal style="--i:${i}">
        <figure class="r-route__photo">${img(ph, { sizes: '(min-width: 960px) 600px, (max-width: 767px) 92vw, 100vw' })}</figure>
        <div class="r-route__body">
          <p class="kicker">${esc(r.label)}</p>
          <h3 class="r-route__road">${icon('route')}${esc(r.road)}</h3>
          <p>${esc(r.text)}</p>
        </div>
      </article>`).join('\n')}
    </div>
  </div>
</section>

<section class="band band--paper r-more" aria-labelledby="r-more-h">
  <div class="wrap r-more__grid">
    <div class="r-more__aside">
      ${head2('About the store', `More ${ul('information')}`, '', { id: 'r-more-h' })}
      <figure class="r-more__photo sk-frame" data-reveal>${img(PH.floor, { sizes: '(min-width: 960px) 440px, (max-width: 767px) 84vw, 100vw' })}</figure>
      <dl class="r-mini">
        <div><dt>Opened</dt><dd>${esc(st.opened)}</dd></div>
        <div><dt>Type</dt><dd>${esc(st.type)}</dd></div>
      </dl>
    </div>
    <div class="r-more__list">
      ${more.map(([q, ans], i) => `<article class="r-qa" data-reveal style="--i:${i}">
        <h3 class="r-qa__q">${esc(q)}</h3>
        <p>${linkify(ans)}</p>
      </article>`).join('\n')}
      <article class="r-qa" data-reveal style="--i:5">
        <h3 class="r-qa__q">Brands on the menu</h3>
        <p>${esc(S.brandsCarried.intro)}</p>
        <ul class="chip-row r-brands">${S.brandsCarried.items.map((b) => `<li class="chip">${esc(b)}</li>`).join('')}</ul>
      </article>
    </div>
  </div>
</section>

<section class="band band--night r-visit" aria-labelledby="r-visit-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap">
    ${head2('Before you go', `Visiting a Minnesota <em>adult-use</em> dispensary`, '', { id: 'r-visit-h' })}
    <div class="r-visit__grid">
      ${visiting.map(([ic, label, texts], i) => `<article class="glass glass--night glass--lift r-visit__card" data-reveal style="--i:${i % 3}">
        ${icon(ic, 'r-ico--lg', true)}
        <h3 class="r-visit__label">${esc(label)}</h3>
        ${texts.map((t) => `<p>${linkify(t)}</p>`).join('')}
      </article>`).join('\n')}
    </div>
  </div>
</section>

<section class="band band--paper r-amen" aria-labelledby="r-amen-h">
  <div class="wrap">
    ${head2('At the Bayport store', `${ul('Amenities')}`, '', { id: 'r-amen-h', center: true })}
    <ul class="r-amen__grid">
      ${amenities.map(([ic, label], i) => `<li class="r-amen__item" data-reveal style="--i:${i % 5}">${icon(ic, 'r-ico--xl', true)}<span>${esc(label)}</span></li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="band band--night r-deals" aria-labelledby="r-deals-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span></div>
  <div class="wrap">
    ${head2('Deals', `Deals at My Dealer <em>Bayport</em>`, esc(S.announcement.text), { id: 'r-deals-h' })}
    <div class="r-coupons">${S.discounts.map(coupon).join('\n')}</div>
    <div class="btn-row r-deals__cta">${int('/dispensaries/minnesota/deals/', 'All deals', 'btn btn--gold')}${ext(st.menuUrl, S.headerCta[1], 'btn btn--glass')}</div>
  </div>
</section>

<section class="band band--paper r-faqs" aria-labelledby="r-faq-h">
  <div class="wrap r-faqs__grid">
    <div class="r-faqs__aside">
      ${head2('FAQ', `Minnesota dispensary <em>FAQs</em>`, '', { id: 'r-faq-h' })}
      <div class="btn-row">${int('/faq', 'All FAQs', 'btn btn--gold')}${int('/cannabis-laws-by-state/minnesota/', 'Minnesota Cannabis Laws', 'btn btn--ghost')}</div>
    </div>
    ${faqList(ctx, ['What are your hours?', 'Where do I park?', 'Do I need to be 21 to shop?', 'What ID do you accept?', 'Can I order ahead for pickup?', 'Do you take credit cards?', 'How much cannabis can I buy at once?', 'Can I use it in the parking lot or my car?', 'Do you sell medical cannabis?'])}
  </div>
</section>

<section class="band band--night r-near" aria-labelledby="r-near-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap">
    ${head2('Areas we serve', `Dispensaries <em>nearby</em>`, esc(S.servedAreas), { id: 'r-near-h' })}
    <div class="r-area-grid r-area-grid--near">${areaCards(ctx, nearby)}${nextCard(ctx, { i: 2 })}</div>
  </div>
</section>`;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      '@id': ORIGIN + path + '#store',
      name: st.name,
      legalName: S.brand.legal,
      description: st.type,
      url: ORIGIN + path,
      telephone: st.tel,
      email: st.email,
      address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal },
      openingHours: 'Mo-Su 12:00-20:00',
      paymentAccepted: st.payment,
      hasMap: st.googleUrl,
      identifier: st.licenseNo,
      sameAs: S.social.map((s) => s.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [['/', 'Home'], ['/dispensaries/', 'Dispensaries'], ['/dispensaries/minnesota/', 'Minnesota'], [path, st.name]].map(([p, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: ORIGIN + p })),
    },
  ];
  return { ...m, jsonld, crumbs: [crumb.home, crumb.disp, crumb.mn, [path, st.name]], bodyClass: 'r-page r-page--location', main };
}

function dealsPage(ctx) {
  const S = ctx.site;
  const st = S.store;
  const m = meta('/dispensaries/minnesota/deals/', 'Deals at My Dealer Bayport | My Dealer', S.announcement.text);
  const main = `
${hero({
    kicker: st.name,
    title: `Deals at My Dealer <em>Bayport</em>`,
    lede: esc(S.announcement.text),
    actions: `${ext(st.menuUrl, S.headerCta[1], 'btn btn--gold')}${int('/rewards/', 'Rewards', 'btn btn--glass')}`,
    side: `<figure class="r-hero__tape sk-tape" data-tilt>${gimg('g-deli-jars', { alt: '', sizes: '(min-width: 960px) 460px, (max-width: 767px) 78vw, 90vw' })}</figure>`,
    cls: 'r-hero--split',
    after: cutout('r-cut--deals'),
  })}
<section class="band band--paper r-deals r-deals--page" aria-labelledby="r-coupons-h">
  <div class="wrap">
    ${head2('Every day', `Discounts with a ${ul('valid ID')}`, '', { id: 'r-coupons-h' })}
    <div class="r-coupons">${S.discounts.map(coupon).join('\n')}</div>
  </div>
</section>
<section class="band band--night r-strip r-strip--night" aria-labelledby="r-member-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span></div>
  <div class="wrap r-strip__grid">
    ${mark3(ctx, 'r-mark3--strip')}
    <div class="r-strip__copy" data-reveal>
      <h2 class="r-strip__title" id="r-member-h">Member deals</h2>
      <p>${esc(S.rewards.text)}</p>
    </div>
    <div class="btn-row r-strip__cta" data-reveal style="--i:1">${int('/rewards/', 'How rewards work', 'btn btn--gold')}</div>
  </div>
</section>
<section class="band band--paper r-faqs" aria-labelledby="r-dfaq-h">
  <div class="wrap r-faqs__grid">
    <div class="r-faqs__aside">
      ${head2('FAQ', `Deals and <em>discounts</em>`, '', { id: 'r-dfaq-h' })}
      <div class="btn-row">${int('/faq', 'All FAQs', 'btn btn--gold')}${ext(st.menuUrl, S.headerCta[1], 'btn btn--ghost')}</div>
    </div>
    ${faqList(ctx, ['Do you have a veteran discount?', 'Is there a discount for Andersen employees?', 'Do you have a rewards program?', 'Can I combine discounts?'])}
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, crumb.disp, crumb.mn, ['/dispensaries/minnesota/deals/', 'Deals']], bodyClass: 'r-page r-page--deals', main };
}

function rewardsPage(ctx) {
  const S = ctx.site;
  const r = S.rewards;
  const m = meta('/rewards/', 'Rewards | My Dealer', r.text);
  const benefits = [
    ['pct', r.points],
    ['star', 'member deals'],
    ['bag', 'Nearly all promotions are for members only.'],
    ['phone', 'Sign up with your phone number'],
  ];
  const main = `
${hero({
    kicker: S.store.name,
    title: `${ul('Rewards')}`,
    lede: esc(r.text),
    actions: `${int('/dispensaries/minnesota/deals/', 'Deals', 'btn btn--gold')}${ext(S.store.menuUrl, S.headerCta[1], 'btn btn--glass')}`,
    side: mark3(ctx, 'r-mark3--hero'),
    cls: 'r-hero--split r-hero--rewards',
    after: cutout('r-cut--rewards'),
  })}
<section class="band band--paper r-benefits" aria-labelledby="r-ben-h">
  <div class="wrap">
    ${head2('Member benefits', `What ${ul('members')} get`, '', { id: 'r-ben-h' })}
    <ul class="r-ben__grid">
      ${benefits.map(([ic, t], i) => `<li class="glass glass--milk glass--lift r-ben" data-reveal style="--i:${i}">${icon(ic, 'r-ico--xl', true)}<span>${esc(t.charAt(0).toUpperCase() + t.slice(1))}</span></li>`).join('\n')}
    </ul>
  </div>
</section>
<section class="band band--night r-faqs r-faqs--night" aria-labelledby="r-rfaq-h">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap r-faqs__grid">
    <div class="r-faqs__aside">
      ${head2('How it works', `Joining and <em>using</em> it`, '', { id: 'r-rfaq-h' })}
      <div class="r-app glass glass--night" data-reveal>
        <h3 class="r-qa__q">Do you have an app?</h3>
        <p>${linkify(S.store.app)}</p>
      </div>
    </div>
    ${faqList(ctx, ['Do you have a rewards program?', 'Can I combine discounts?'])}
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, ['/rewards/', 'Rewards']], bodyClass: 'r-page r-page--rewards', main };
}

function guidesPage(ctx) {
  const S = ctx.site;
  const m = meta('/dispensary-guides/', 'Dispensary Guide | My Dealer', S.servedAreas);
  const mnCards = [
    { path: S.store.path, name: S.store.name, state: 'MN', blurb: S.store.type },
    ...S.areas.filter((a) => a.state === 'MN'),
  ];
  const wiCards = S.areas.filter((a) => a.state === 'WI');
  const main = `
${hero({
    kicker: 'Dispensary Guide',
    title: `Guides by <em>town</em>`,
    lede: esc(S.servedAreas),
    actions: `${int(S.store.path, S.store.name, 'btn btn--gold')}${int('/cannabis-laws-by-state/', 'Cannabis laws by state', 'btn btn--glass')}`,
    side: `<div class="r-sketches" aria-hidden="true">${gimg('s-leaf', { alt: '', cls: 'r-sketch r-sketch--a', sizes: '(max-width: 767px) 180px, 260px' })}${gimg('s-bud', { alt: '', cls: 'r-sketch r-sketch--b', sizes: '(max-width: 767px) 150px, 220px' })}</div>`,
    cls: 'r-hero--split',
    after: cutout('r-cut--hero'),
  })}
<section class="band band--paper r-guides" aria-labelledby="${sec('g-mn')}">
  <div class="wrap">
    ${head2('Minnesota', `${ul('Minnesota')}`, '', { id: sec('g-mn') })}
    <figure class="r-strip-photo sk-frame" data-reveal>${img(PH.north, { sizes: '(min-width: 1280px) 1240px, (max-width: 767px) 92vw, 100vw' })}</figure>
    <div class="r-area-grid">${areaCards(ctx, mnCards)}</div>
  </div>
</section>
<section class="band band--night r-guides" aria-labelledby="${sec('g-wi')}">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span></div>
  <div class="wrap">
    ${head2('Wisconsin', `Wisconsin <em>shoppers</em>`, '', { id: sec('g-wi') })}
    <figure class="r-strip-photo sk-frame" data-reveal>${img(PH.south, { sizes: '(min-width: 1280px) 1240px, (max-width: 767px) 92vw, 100vw' })}</figure>
    <div class="r-area-grid">${areaCards(ctx, wiCards)}</div>
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, ['/dispensary-guides/', 'Dispensary Guide']], bodyClass: 'r-page r-page--guides', main };
}

function lawsHub(ctx) {
  const S = ctx.site;
  const wi = S.areas.find((a) => a.slug === 'wisconsin');
  const m = meta('/cannabis-laws-by-state/', 'Cannabis Laws by State | My Dealer', `${S.store.age} ${S.store.limits}`);
  const cards = [
    { path: '/cannabis-laws-by-state/minnesota/', name: 'Minnesota Cannabis Laws', state: 'MN', blurb: S.store.limits },
    { path: wi.path, name: wi.name, state: 'WI', blurb: wi.blurb },
  ];
  const main = `
${hero({
    kicker: 'Resources',
    title: `Cannabis laws <em>by state</em>`,
    lede: 'Quoted word for word from our FAQ and our Wisconsin shoppers guide.',
    actions: `${int('/cannabis-laws-by-state/minnesota/', 'Minnesota Cannabis Laws', 'btn btn--gold')}${int(wi.path, wi.name, 'btn btn--glass')}`,
    side: `<div class="r-sketches" aria-hidden="true">${gimg('s-jar', { alt: '', cls: 'r-sketch r-sketch--a', sizes: '(max-width: 767px) 180px, 260px' })}</div>`,
    cls: 'r-hero--split',
    after: cutout('r-cut--hero'),
  })}
<section class="band band--paper r-laws" aria-labelledby="${sec('states')}">
  <div class="wrap">
    ${head2('States', `Pick a ${ul('state')}`, '', { id: sec('states') })}
    <div class="r-area-grid r-area-grid--two">${areaCards(ctx, cards)}</div>
    <p class="r-ocm">${icon('doc')}<a${linkAttrs('https://mn.gov/ocm/')}>Minnesota Office of Cannabis Management<span class="r-ext" aria-hidden="true">&#8599;</span><span class="r-sr"> (opens in a new tab)</span></a></p>
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, ['/cannabis-laws-by-state/', 'Cannabis laws by state']], bodyClass: 'r-page r-page--laws', main };
}

function lawsMinnesota(ctx) {
  const S = ctx.site;
  const st = S.store;
  const m = meta('/cannabis-laws-by-state/minnesota/', 'Minnesota Cannabis Laws | My Dealer', `${st.age} ${st.limits}`);
  const quick = [
    ['id', 'Age', st.age],
    ['scale', 'Purchase limits', st.limits],
    ['no', 'On-site consumption', st.consumption],
    ['doc', 'Medical cannabis', st.medical],
  ];
  const groups = [
    ['Buying', ['Do I need to be 21 to shop?', 'What ID do you accept?', 'How much cannabis can I buy at once?', 'What taxes are on cannabis in Minnesota?']],
    ['Using and carrying', ['Where can I legally use cannabis in Minnesota?', 'Can I use it in the parking lot or my car?', 'How should I carry cannabis in the car?', 'Can I drive after using cannabis?']],
    ['Growing and medical', ['Can I grow my own?', 'Do you sell medical cannabis?']],
  ];
  const wiWho = sectionBlocks(ctx, 'wisconsin', 'who-can-buy');
  const wiUse = sectionBlocks(ctx, 'wisconsin', 'using-it-legally-in-minnesota');
  const main = `
${hero({
    kicker: 'Cannabis laws by state',
    title: `Minnesota cannabis <em>laws</em>`,
    lede: 'Quoted word for word from our FAQ and our Wisconsin shoppers guide.',
    actions: `${ext('https://mn.gov/ocm/', 'Minnesota Office of Cannabis Management', 'btn btn--gold')}${int('/faq', 'FAQ', 'btn btn--glass')}`,
    side: `<div class="r-sketches" aria-hidden="true">${gimg('s-leaf', { alt: '', cls: 'r-sketch r-sketch--a', sizes: '(max-width: 767px) 180px, 260px' })}</div>`,
    cls: 'r-hero--split',
    after: cutout('r-cut--hero'),
  })}
<section class="band band--paper r-quick" aria-labelledby="${sec('quick')}">
  <div class="wrap">
    ${head2('At a glance', `The ${ul('short')} version`, '', { id: sec('quick') })}
    <div class="r-visit__grid r-visit__grid--4">
      ${quick.map(([ic, label, t], i) => `<article class="glass glass--milk r-visit__card" data-reveal style="--i:${i}">${icon(ic, 'r-ico--lg')}<h3 class="r-visit__label">${esc(label)}</h3><p>${esc(t)}</p></article>`).join('\n')}
    </div>
  </div>
</section>
${groups.map(([g, qs], gi) => `<section class="band ${gi % 2 ? 'band--paper' : 'band--night'} r-faqs${gi % 2 ? '' : ' r-faqs--night'}" aria-labelledby="${sec('law-' + gi)}">
  ${gi % 2 ? '' : '<div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--sage"></span></div>'}
  <div class="wrap r-faqs__grid">
    <div class="r-faqs__aside">
      ${head2('From our FAQ', esc(g), '', { id: sec('law-' + gi) })}
      ${fromSource('From our FAQ', '/faq')}
    </div>
    ${faqList(ctx, qs)}
  </div>
</section>`).join('\n')}
<section class="band band--night r-wiq" aria-labelledby="${sec('wiq')}">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span></div>
  <div class="wrap">
    ${head2('From our Wisconsin shoppers guide', `Who can buy, and <em>where</em> to use it`, '', { id: sec('wiq') })}
    <div class="r-wiq__grid">
      <div class="glass glass--night r-quote prose" data-reveal>${renderBlocks(wiWho, ctx, { headingShift: 1 })}${fromSource('From our Wisconsin shoppers guide', '/wisconsin#who-can-buy')}</div>
      <div class="glass glass--night r-quote prose" data-reveal style="--i:1">${renderBlocks(wiUse, ctx, { headingShift: 1 })}${fromSource('From our Wisconsin shoppers guide', '/wisconsin#using-it-legally-in-minnesota')}</div>
    </div>
    <p class="r-ocm">${icon('doc')}<a${linkAttrs('https://mn.gov/ocm/')}>Minnesota Office of Cannabis Management<span class="r-ext" aria-hidden="true">&#8599;</span><span class="r-sr"> (opens in a new tab)</span></a></p>
  </div>
</section>`;
  return { ...m, crumbs: [crumb.home, ['/cannabis-laws-by-state/', 'Cannabis laws by state'], ['/cannabis-laws-by-state/minnesota/', 'Minnesota']], bodyClass: 'r-page r-page--laws', main };
}

// ---------- blog ----------
const POST_ART = {
  'cannabis-101': { gen: 's-leaf', sketch: true },
  flower: { gen: 'g-bud-macro' },
  'pre-rolls': { gen: 'g-prerolls' },
  edibles: { gen: 'g-edibles' },
  vapes: { gen: 'g-vape' },
  beverages: { gen: 'g-beverage' },
  shop: { photo: PH.floor },
  wisconsin: { photo: PH.signUp },
  faq: { gen: 's-hat', sketch: true },
  company: { photo: PH.stick, sketch: true },
  build: { photo: PH.windows },
};

function posts(ctx) {
  return ctx.ia.blogPosts.map((p) => {
    const slug = p.path.replace(/^\/|\/$/g, '');
    const doc = ctx.content[slug];
    if (!doc) { missing.push('blog post content: ' + slug); return null; }
    const cat = ctx.ia.blogCategories.find((c) => c.slug === p.cat);
    return { path: p.path, slug, title: h1Of(doc), excerpt: doc.description, cat };
  }).filter(Boolean);
}

function postArt(slug, sizes) {
  const a = POST_ART[slug] || { gen: 'g-smoke' };
  const inner = a.gen ? gimg(a.gen, { alt: '', sizes }) : img(a.photo, { alt: '', sizes });
  return `<div class="card__media r-post__media${a.sketch ? ' r-post__media--sketch' : ''}">${inner}</div>`;
}

function postCard(p, i, feature = false) {
  return `<a class="card r-post${feature ? ' r-post--feature' : ''}" data-reveal style="--i:${i % 3}"${linkAttrs(p.path)}>
    ${postArt(p.slug, feature ? '(min-width: 960px) 640px, (max-width: 767px) 92vw, 100vw' : '(min-width: 960px) 400px, (max-width: 767px) 88px, 100vw')}
    <span class="r-post__body">
      <span class="r-post__cat">${esc(p.cat?.name || '')}</span>
      <span class="r-post__title">${ulHover(esc(p.title))}</span>
      <span class="r-post__excerpt">${esc(p.excerpt)}</span>
      <span class="r-post__more">Read ${arrow()}</span>
    </span>
  </a>`;
}

function blogPage(ctx, cat) {
  const all = posts(ctx);
  const list = cat ? all.filter((p) => p.cat?.slug === cat.slug) : all;
  const path = cat ? `/blog/${cat.slug}/` : '/blog/';
  const title = cat ? `${cat.name} | Blog | My Dealer` : 'Blog | My Dealer';
  const description = cat ? `${cat.name}: ${list.map((p) => p.title).join(' · ')}` : `Guides from My Dealer in Bayport, MN: ${all.slice(0, 4).map((p) => p.title).join(' · ')}`;
  const m = meta(path, title, description);
  const filters = [['/blog/', 'All', !cat], ...ctx.ia.blogCategories.map((c) => [`/blog/${c.slug}/`, c.name, cat?.slug === c.slug])];
  const [first, ...rest] = list;
  const main = `
${hero({
    kicker: cat ? 'Blog' : 'Resources',
    title: cat ? `${ul(esc(cat.name))}` : `The ${ul('blog')}`,
    lede: cat ? `${list.length} ${list.length === 1 ? 'guide' : 'guides'} from My Dealer.` : 'Guides from My Dealer, by topic.',
    bg: gimg('g-smoke', { alt: '', eager: true, sizes: '100vw', cls: 'r-hero__bg r-hero__bg--smoke' }),
    cls: 'r-hero--blog',
    after: `<nav class="wrap r-filter" aria-label="Blog categories"><ul class="chip-row">${filters.map(([h, l, on]) => `<li><a class="chip${on ? ' is-on' : ''}"${linkAttrs(h, on ? { 'aria-current': 'page' } : {})}>${esc(l)}</a></li>`).join('')}</ul></nav>`,
  })}
<section class="band band--paper r-blog" aria-label="${escA(cat ? cat.name : 'All posts')}">
  <div class="wrap">
    ${first ? postCard(first, 0, true) : ''}
    <div class="r-post-grid">${rest.map((p, i) => postCard(p, i)).join('\n')}</div>
  </div>
</section>`;
  const crumbs = cat ? [crumb.home, ['/blog/', 'Blog'], [path, cat.name]] : [crumb.home, ['/blog/', 'Blog']];
  return { ...m, crumbs, bodyClass: 'r-page r-page--blog', main };
}

// ---------- render ----------
export async function render(ctx) {
  for (const v of Object.values(PH)) {
    const id = v.src.split('/').pop().replace(/\.\w+$/, '');
    const reg = (ctx.images?.photos || {})[id];
    if (reg && reg.alt && v.alt) v.alt = reg.alt;
  }
  const defs = [
    dispensariesHub(ctx),
    minnesotaHub(ctx),
    locationPage(ctx),
    dealsPage(ctx),
    rewardsPage(ctx),
    guidesPage(ctx),
    lawsHub(ctx),
    lawsMinnesota(ctx),
    blogPage(ctx, null),
    ...ctx.ia.blogCategories.map((c) => blogPage(ctx, c)),
  ];
  if (missing.length) console.warn('warning: hubs: captured content not found: ' + [...new Set(missing)].join(' | '));
  return defs.map((d) => ({
    path: d.path,
    html: page({ ctx, path: d.path, title: d.title, description: d.description, canonical: d.canonical, og: d.og, jsonld: d.jsonld || [], bodyClass: d.bodyClass, main: d.main, crumbs: d.crumbs }),
  }));
}
