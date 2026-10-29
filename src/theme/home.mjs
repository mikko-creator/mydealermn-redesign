// home.mjs - the home page "/" (FOUNDATION). Adopted section order (BUILD-CONTRACT section 6), My Dealer's words only:
// every visible sentence below comes from ctx.content.home / shop / company / vapes or ctx.site, placed as captured
// html strings (never retyped). New words are neutral glue only (section labels, button labels).
import { page } from './shell.mjs';
import { esc, escA, attrs, linkAttrs, fixLinks, img, gimg, skUnderline, skCircle, skArrow, skFrame, stripTags } from './util.mjs';

// ---------- captured-block access (throws if the capture changed shape, so copy is never silently dropped) ----------
const must = (v, what) => { if (v == null || v === '') throw new Error('home: captured block missing: ' + what); return v; };
const ofType = (blocks, t) => (blocks || []).filter((b) => b.t === t);
const nth = (blocks, t, n = 0, what = t) => must(ofType(blocks, t)[n], what);
const walk = (blocks, fn) => { for (const b of blocks || []) { fn(b); if (b.blocks) walk(b.blocks, fn); } };
const findAll = (blocks, pred) => { const out = []; walk(blocks, (b) => pred(b) && out.push(b)); return out; };
const isExt = (u) => /^https?:\/\//i.test(String(u)) || /^\/bayport(?:[/?#]|$)/.test(String(u));
const ICO = {
  ext: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
  arrow: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  pin: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  pause: '<svg class="ico h-film-btn__pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5v14"/><path d="M15 5v14"/></svg>',
  play: '<svg class="ico h-film-btn__play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15l12-7.5Z"/></svg>',
};
// captured link items -> buttons (styles cycle through the list)
function btns(items, styles = ['btn--gold'], extra = '') {
  return `<div class="btn-row${extra ? ' ' + extra : ''}">${items.map((it, i) => `<a class="btn ${styles[i % styles.length]}"${linkAttrs(it.href)}>${fixLinks(it.html)}${isExt(it.href) ? ICO.ext : ICO.arrow}</a>`).join('')}</div>`;
}
const P = (b, cls = '') => `<p${attrs({ class: cls })}>${fixLinks(b.html)}</p>`;

// ---------- the redrawn route map (geometry and labels read from the captured SVG) ----------
function routeMap(svgRaw) {
  const raw = must(svgRaw, 'route map svg');
  const label = must((raw.match(/aria-label="([^"]+)"/) || [])[1], 'route map aria-label');
  const texts = [...raw.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => {
    const a = Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    return { x: +a.x, y: +a.y, anchor: a['text-anchor'] || 'start', transform: a.transform || '', fill: a.fill || '', size: +a['font-size'] || 11, text: m[2] };
  });
  const paths = [...raw.matchAll(/<path d="([^"]+)"([^>]*)>/g)].map((m) => ({ d: m[1], rest: m[2] }));
  const river = must(paths.find((p) => /Z\s*$/.test(p.d) && /#2f3d3a/.test(p.rest)), 'river path').d;
  const roads = paths.filter((p) => /fill="none"/.test(p.rest));
  const i94 = must(roads[0], 'I-94 path').d;
  const h36 = must(roads[1], 'Hwy 36 path').d;
  const h95 = must(roads[2], 'Hwy 95 path').d;
  const bank = river.replace(/\s*L640.*$/, '');
  // label classes by captured colour: gold = exits + store, sage = towns/river, cream = road names
  const cls = (t) => (t.fill === '#e2b65a' ? 'h-map__t--gold' : t.fill === '#9fb07a' ? 'h-map__t--town' : 'h-map__t--road');
  const textEls = texts.map((t, i) => `<text class="h-map__t ${cls(t)}${/My Dealer/.test(t.text) ? ' h-map__t--store' : ''}" x="${t.x}" y="${t.y}" text-anchor="${t.anchor}"${t.transform ? ` transform="${escA(t.transform)}"` : ''} style="--i:${i}">${esc(t.text)}</text>`).join('');
  return `<svg class="h-map__svg sk" viewBox="0 0 640 400" role="img" aria-label="${escA(label)}" data-draw>
<defs><pattern id="h-map-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" stroke="#2f3d3a" stroke-width="1.1" opacity="0.55"/></pattern><clipPath id="h-map-river"><path d="${escA(river)}"/></clipPath></defs>
<rect x="0" y="0" width="640" height="400" fill="url(#h-map-hatch)" clip-path="url(#h-map-river)" class="h-map__water"/>
<g filter="url(#sk-rough)">
<path class="sk-p h-map__bank" pathLength="1" d="${escA(bank)}" style="--d:0s"/>
<path class="sk-p h-map__bank h-map__bank--2" pathLength="1" d="${escA(bank)}" transform="translate(9 4)" style="--d:.2s"/>
<path class="sk-p h-map__road h-map__road--case" pathLength="1" d="${escA(i94)}" style="--d:.3s"/>
<path class="sk-p h-map__road" pathLength="1" d="${escA(i94)}" style="--d:.45s"/>
<path class="sk-p h-map__road h-map__road--case" pathLength="1" d="${escA(h36)}" style="--d:.5s"/>
<path class="sk-p h-map__road" pathLength="1" d="${escA(h36)}" style="--d:.65s"/>
<path class="sk-p h-map__hwy" pathLength="1" d="${escA(h95)}" style="--d:.8s"/>
<path class="sk-p h-map__ring" pathLength="1" d="M507 131C493 126 482 136 483 149C484 162 500 168 511 160C519 153 518 139 504 134" style="--d:2s"/>
</g>
<path class="h-map__star" d="M500 137 L502.4 144.6 L510.5 144.6 L504 149.4 L506.5 157.2 L500 152.4 L493.5 157.2 L496 149.4 L489.5 144.6 L497.6 144.6 Z"/>
${textEls}
</svg>`;
}

export async function render(ctx) {
  const H = must(ctx.content.home, 'home page json');
  const S = H.sections;
  const site = ctx.site;
  const st = site.store;

  // --- captured pieces ---
  const hero = S[0].blocks;
  const film = nth(hero, 'video', 0, 'hero film');
  const h1 = nth(hero, 'h1', 0, 'hero h1');
  const heroPs = ofType(hero, 'p');
  const tagline = must(heroPs[0], 'tagline p');
  const intro = must(heroPs[1], 'intro p');
  const heroLinks = nth(hero, 'links', 0, 'hero links').items;
  const marquee = ofType(S[1].blocks, 'text');
  if (marquee.length < 8) throw new Error('home: marquee items missing');
  const dealer = S[2].blocks;
  const dealerCards = nth(dealer, 'grid', 0, 'dealer grid').blocks;
  const storeGrid = nth(S[3].blocks, 'grid', 0, 'store grid').blocks;
  const bayCard = must(storeGrid[0], 'Bayport card').blocks;
  const findCard = must(storeGrid[1], 'How to find us card');
  const wabCard = must(storeGrid[2], 'Wabasha card').blocks;
  const know = S[4].blocks;
  const noon = S[5].blocks;
  const shop = must(ctx.content.shop, 'shop page json');
  const shopWays = must(shop.sections.find((s) => s.blocks.some((b) => b.t === 'h2' && /ways to shop/i.test(b.html))), 'shop three ways').blocks;
  const quote = must(findAll(must(ctx.content.company, 'company json').sections.flatMap((s) => s.blocks), (b) => b.t === 'quote')[0], 'company quote');
  const vapes = must(ctx.content.vapes, 'vapes json').sections[0].blocks;

  // ---------- 1. hero: brand film under frosted glass; dealer cut-out crosses the seam ----------
  const films = (film.sources || []).map((s) => `<source src="${escA(s.src.replace(/^\/brand\//, '/assets/media/'))}" type="${escA(s.type)}"${s.media ? ` media="${escA(s.media)}"` : ''}>`).join('');
  const taglineHtml = tagline.html.replace('<em>', '<em class="scribble">').replace('</em>', skUnderline() + '</em>');
  const heroHtml = `<section class="h-hero band band--night band--over" aria-labelledby="h-hero-h1">
<div class="band__clip h-hero__clip">
<video id="hero-film" class="h-hero__film" autoplay muted loop playsinline preload="auto" poster="/assets/photos/film-poster.jpg" aria-hidden="true">${films}</video>
<span class="h-hero__shade"></span>
</div>
<div class="wrap wrap--wide h-hero__inner">
<div class="h-hero__panel glass" data-reveal="left">
<h1 class="h-hero__h1" id="h-hero-h1">${ICO.pin}<span>${fixLinks(h1.html)}</span></h1>
<p class="display display--hero h-hero__tag">${taglineHtml}</p>
${P(intro, 'h-hero__intro')}
${btns(heroLinks, ['btn--glass', 'btn--gold'], 'h-hero__ctas')}
</div>
</div>
<button class="h-film-btn" type="button" data-video-toggle aria-controls="hero-film" aria-pressed="false" data-label-pause="Pause the film" data-label-play="Play the film">${ICO.pause}${ICO.play}<span class="sr-only" data-label>Pause the film</span></button>
<div class="h-hero__dealer protrude"><span class="h-hero__dealer-in float"><img src="/assets/brand/dealer-cut.png" alt="" width="458" height="388" decoding="async" fetchpriority="high"></span></div>
</section>`;

  // ---------- 2. marquee (the 24 captured items, moved by one third) ----------
  const marqueeHtml = `<div class="h-marquee" data-marquee="3" aria-label="${escA(stripTags(marquee.slice(0, 8).map((b) => b.html).join(' · ')))}" role="region">
<div class="marquee__track" aria-hidden="true">${marquee.map((b, i) => `<span class="h-marquee__item${i % 8 === 7 ? ' h-marquee__item--accent' : ''}">${fixLinks(b.html)}</span>`).join('')}</div>
</div>`;

  // ---------- 3. shop by category (site.json categories) + brands carried ----------
  const catImg = { flower: 'g-deli-jars', 'pre-rolls': 'g-prerolls', edibles: 'g-edibles', vapes: 'g-vape', beverages: 'g-beverage' };
  const cats = site.categories.map((c, i) => `<a class="h-cat${i === 0 ? ' h-cat--lead' : ''}"${linkAttrs(c.path)} data-reveal style="--i:${i}">
<span class="h-cat__media">${gimg(catImg[c.slug], { sizes: i === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 1024px) 22vw, 50vw', alt: '' })}</span>
<span class="h-cat__body"><span class="h-cat__name">${esc(c.name)}</span><span class="h-cat__blurb">${esc(c.blurb)}</span><span class="h-cat__go">${ICO.arrow}</span></span>
</a>`).join('');
  const brands = site.brandsCarried;
  const catsHtml = `<section class="h-cats band band--paper" aria-labelledby="h-cats-h">
<div class="wrap wrap--wide">
<div class="h-cats__head">
<div class="band__head" data-reveal><p class="kicker">Shop by category</p><h2 id="h-cats-h" class="display">Shop by <span class="scribble">category${skUnderline()}</span></h2></div>
<div class="h-cats__sketch" aria-hidden="true">${gimg('s-leaf', { sizes: '220px', alt: '', cls: 'sk-illo' })}</div>
</div>
<div class="h-cats__grid">${cats}</div>
<div class="h-brands" data-reveal><p class="h-brands__intro">${esc(brands.intro)}</p><div class="chip-row">${brands.items.map((b) => `<a class="chip"${linkAttrs(st.menuUrl)}>${esc(b)}</a>`).join('')}</div></div>
</div>
</section>`;

  // ---------- 4. how to shop (captured /shop: three ways) ----------
  const waysH2 = nth(shopWays, 'h2', 0, 'three ways h2');
  const ways = nth(shopWays, 'grid', 0, 'three ways grid').blocks;
  const waysHtml = `<section class="h-ways band band--night" aria-labelledby="h-ways-h">
<div class="band__clip h-ways__clip"><video class="h-ways__smoke" autoplay muted loop playsinline preload="metadata" poster="/assets/media/loop-smoke.jpg" aria-hidden="true" data-ambient><source src="/assets/media/loop-smoke-sm.mp4" type="video/mp4" media="(max-width: 720px)"><source src="/assets/media/loop-smoke.mp4" type="video/mp4"></video></div>
<div class="wrap wrap--wide">
<div class="band__head" data-reveal><p class="kicker">How to shop</p><h2 id="h-ways-h" class="display">${fixLinks(waysH2.html)}</h2></div>
<ol class="h-ways__list">${ways.map((c, i) => {
    const b = c.blocks;
    const h3 = nth(b, 'h3', 0, 'way h3');
    const links = ofType(b, 'links')[0];
    return `<li class="h-way glass glass--lift" data-reveal style="--i:${i}" data-tilt="4"><span class="h-way__n" aria-hidden="true">${i + 1}</span><h3 class="h-way__h">${fixLinks(h3.html)}</h3>${ofType(b, 'p').map((p) => P(p, 'h-way__p')).join('')}${links ? btns(links.items, ['btn--gold']) : ''}</li>`;
  }).join('')}</ol>
</div>
</section>`;

  // ---------- 5. you already have a dealer (three comparison cards) ----------
  const dH2 = nth(dealer, 'h2', 0, 'dealer h2');
  const dP = nth(dealer, 'p', 0, 'dealer p');
  const dealerHtml = `<section class="h-dealer band band--paper" aria-labelledby="h-dealer-h">
<div class="wrap wrap--wide">
<div class="h-dealer__head">
<div data-reveal><p class="kicker">My Dealer</p><h2 id="h-dealer-h" class="display h-dealer__h">${fixLinks(dH2.html)}</h2></div>
<div class="h-dealer__lede" data-reveal style="--i:1">${P(dP, 'lede')}</div>
<div class="h-dealer__hat" aria-hidden="true">${gimg('s-hat', { sizes: '260px', alt: '', cls: 'sk-illo' })}</div>
</div>
<div class="h-compare">${dealerCards.map((c, i) => {
    const b = c.blocks;
    const label = nth(b, 'p', 0, 'compare label');
    const h3 = nth(b, 'h3', 0, 'compare h3');
    const body = ofType(b, 'p').slice(1);
    const real = i === dealerCards.length - 1;
    return `<article class="h-compare__card${real ? ' h-compare__card--real' : ''}" data-reveal style="--i:${i}">
<p class="h-compare__label">${real ? `<span class="sk-circled">${fixLinks(label.html)}${skCircle()}</span>` : fixLinks(label.html)}</p>
<h3 class="h-compare__h">${fixLinks(h3.html)}</h3>
${body.map((p) => P(p)).join('')}
${real ? `<span class="h-compare__check" aria-hidden="true">${skArrow('down-left')}</span>` : `<span class="h-compare__x" aria-hidden="true"><svg class="sk" viewBox="0 0 40 40" data-draw><g filter="url(#sk-rough)"><path class="sk-p" pathLength="1" d="M8 9C17 18 25 25 33 32"/><path class="sk-p" pathLength="1" d="M32 8C24 17 16 25 7 33" style="--d:.3s"/></g></svg></span>`}
</article>`;
  }).join('')}</div>
</div>
</section>`;

  // ---------- 6. brand statement (captured /company blockquote) ----------
  const quoteHtml = `<section class="h-quote band band--night" aria-label="${escA(site.brand.name)}">
<div class="band__clip h-quote__clip"><span class="h-quote__glow"></span></div>
<div class="wrap wrap--narrow h-quote__inner">
<span class="h-quote__mark" aria-hidden="true">“</span>
<blockquote class="h-quote__q" data-reveal><p>${fixLinks(quote.html)}</p></blockquote>
<p class="h-quote__by" data-reveal style="--i:1"><a class="h-quote__link sk-hover"${linkAttrs('/company')}><span class="scribble">From the company story${skUnderline({ hover: true })}</span>${ICO.arrow}</a></p>
</div>
</section>`;

  // ---------- 7. flower spotlight (site.json deliFlower, verbatim) ----------
  const df = site.deliFlower;
  const flowerHtml = `<section class="h-flower band band--paper" aria-labelledby="h-flower-h">
<div class="wrap wrap--wide h-flower__grid">
<div class="h-flower__media" data-reveal="left">
<figure class="sk-frame h-flower__frame">${gimg('g-bud-macro', { sizes: '(min-width: 1024px) 56vw, 100vw', alt: '' })}${skFrame()}</figure>
<figure class="sk-tape h-flower__tape" style="--tilt:4deg" data-depth="0.1">${gimg('g-deli-jars', { sizes: '(min-width: 1024px) 22vw, 50vw', alt: '' })}</figure>
<span class="sk-note h-flower__note" aria-hidden="true">${esc(df.intro.split('. ')[0].replace(/^Deli flower is /, ''))}</span>
</div>
<div class="h-flower__copy">
<div data-reveal><p class="kicker">Flower</p><h2 id="h-flower-h" class="display">Deli <span class="scribble">flower${skUnderline()}</span></h2></div>
<p class="lede" data-reveal style="--i:1">${esc(df.intro)}</p>
<div class="h-tiers">${df.tiers.map((t, i) => `<div class="h-tier glass glass--milk" data-reveal style="--i:${i + 2}"><p class="h-tier__name">${esc(t.name)}</p><p class="h-tier__strains">${esc(t.strains)}</p><p class="h-tier__prices">${esc(t.prices)}</p></div>`).join('')}</div>
<div class="btn-row" data-reveal style="--i:4"><a class="btn btn--gold"${linkAttrs(st.menuUrl)}>${esc(ctx.ia.cta[1])}${ICO.ext}</a><a class="btn btn--ghost"${linkAttrs('/flower')}>${esc(site.categories[0].name)}${ICO.arrow}</a></div>
</div>
</div>
</section>`;

  // ---------- 8. vapes spotlight (captured /vapes intro) ----------
  const vKick = nth(vapes, 'p', 0, 'vapes kicker');
  const vH = nth(vapes, 'h1', 0, 'vapes h1');
  const vP = nth(vapes, 'p', 1, 'vapes intro');
  const vLinks = nth(vapes, 'links', 0, 'vapes links').items;
  const vapesHtml = `<section class="h-vapes band band--night" aria-labelledby="h-vapes-h">
<div class="band__clip"><span class="h-vapes__glow"></span></div>
<div class="wrap wrap--wide h-vapes__grid">
<div class="h-vapes__copy">
<div data-reveal><p class="kicker">${fixLinks(vKick.html)}</p><h2 id="h-vapes-h" class="display">${fixLinks(vH.html)}</h2></div>
${P(vP, 'lede')}
${btns(vLinks, ['btn--gold', 'btn--glass', 'btn--ghost'])}
</div>
<div class="h-vapes__media" data-reveal="right">
<div class="h-vapes__card glass" data-tilt="5">${gimg('g-vape', { sizes: '(min-width: 1024px) 44vw, 100vw', alt: '' })}</div>
<span class="sk-note h-vapes__note" aria-hidden="true">${esc((stripTags(nth(ctx.content.vapes.sections[1].blocks[0].blocks, 'p', 0, 'vape formats').html).match(/all-in-one \(AIO\)/) || ['all-in-one'])[0])}</span>
<span class="h-vapes__arrow" aria-hidden="true">${skArrow('down-right')}</span>
</div>
</div>
</section>`;

  // ---------- 9. Bayport first store + how to find us (route map) + Wabasha next ----------
  const bImg = nth(bayCard, 'img', 0, 'storefront img');
  const bH2 = nth(bayCard, 'h2', 0, 'Bayport h2');
  const bPs = ofType(bayCard, 'p');
  const bLinks = nth(bayCard, 'links', 0, 'Bayport links').items;
  const build = nth(bayCard, 'linkcard', 0, 'see the build');
  const buildText = nth(build.blocks, 'text', 0, 'see the build text');
  const fb = findCard.blocks;
  const fPs = ofType(fb, 'p');
  if (fPs.length < 10) throw new Error('home: how-to-find-us paragraphs missing');
  const fDir = nth(fb, 'text', 0, 'get directions text');
  const mapRaw = must(ofType(fb, 'svg').find((s) => /viewBox="0 0 640 400"/.test(s.raw)), 'route map').raw;
  const figs = nth(fb, 'grid', 0, 'north/south figures').blocks;
  const photoSrc = (s) => '/assets/photos/' + String(s).split('?')[0].split('/').pop();
  const wH2 = nth(wabCard, 'h2', 0, 'Wabasha h2');
  const wP = nth(wabCard, 'p', 0, 'Wabasha p');
  const wUl = nth(wabCard, 'ul', 0, 'Wabasha list');
  const storeHtml = `<section class="h-store band band--paper" aria-labelledby="h-store-h">
<div class="wrap wrap--wide">
<div class="h-store__top">
<figure class="h-store__photo sk-tape protrude-in" style="--tilt:-3deg" data-reveal="zoom">${img({ src: photoSrc(bImg.src), alt: bImg.alt }, { sizes: '(min-width: 1024px) 46vw, 100vw' })}<figcaption>${fixLinks(fPs[1].html)}</figcaption></figure>
<div class="h-store__copy">
<div data-reveal><p class="kicker">${esc(st.name)}</p><h2 id="h-store-h" class="display">${fixLinks(bH2.html)}</h2></div>
${bPs.map((p, i) => P(p, i === 1 ? 'h-store__deal' : 'h-store__p')).join('')}
${btns(bLinks, ['btn--gold', 'btn--ghost'])}
<a class="h-store__build sk-hover"${linkAttrs(build.href)}><span class="scribble">${fixLinks(buildText.html)}${skUnderline({ hover: true })}</span>${ICO.arrow}</a>
</div>
</div>
<div class="h-find">
<div class="h-find__map" data-reveal>
<p class="h-find__k kicker">${fixLinks(fPs[0].html)}</p>
<div class="h-map">${routeMap(mapRaw)}</div>
</div>
<div class="h-find__copy">
<p class="h-find__addr" data-reveal>${fixLinks(fPs[1].html)}<br>${fixLinks(fPs[2].html)}</p>
<div class="h-find__dirs">
<div class="h-dir" data-reveal style="--i:1"><p class="h-dir__k">${fixLinks(fPs[3].html)}</p><p class="h-dir__road">${fixLinks(fPs[4].html)}</p><p>${fixLinks(fPs[5].html)}</p></div>
<div class="h-dir" data-reveal style="--i:2"><p class="h-dir__k">${fixLinks(fPs[6].html)}</p><p class="h-dir__road">${fixLinks(fPs[7].html)}</p><p>${fixLinks(fPs[8].html)}</p></div>
</div>
<div class="h-find__figs">${figs.map((f, i) => { const im = nth(f.blocks, 'img', 0, 'direction photo'); return `<figure class="sk-frame h-find__fig" data-reveal style="--i:${i + 3}">${img({ src: photoSrc(im.src), alt: im.alt }, { sizes: '(min-width: 1024px) 24vw, 100vw' })}${f.caption ? `<figcaption class="sk-frame__cap">${fixLinks(f.caption)}</figcaption>` : ''}</figure>`; }).join('')}</div>
<p class="h-find__land" data-reveal>${fixLinks(fPs[9].html)}</p>
<div class="btn-row"><a class="btn btn--gold"${linkAttrs(findCard.href)}>${fixLinks(fDir.html)}${ICO.ext}</a></div>
</div>
</div>
<aside class="h-next card" aria-labelledby="h-next-h" data-reveal>
<div><p class="kicker">${esc(site.brand.footerSub)}</p><h2 id="h-next-h" class="h-next__h">${fixLinks(wH2.html)}</h2>${P(wP)}</div>
<ul class="h-next__list">${wUl.items.map((it) => `<li>${fixLinks(it)}</li>`).join('')}</ul>
</aside>
</div>
</section>`;

  // ---------- 10. know what you are buying ----------
  const kH2 = nth(know, 'h2', 0, 'know h2');
  const kP = nth(know, 'p', 0, 'know p');
  const kLinks = nth(know, 'links', 0, 'know links').items;
  const kImg = nth(know, 'img', 0, 'know logo');
  const knowHtml = `<section class="h-know band band--night" aria-labelledby="h-know-h">
<div class="band__clip"><span class="h-know__glow"></span></div>
<div class="wrap wrap--wide h-know__grid">
<div class="h-know__art" aria-hidden="true">${gimg('s-leaf', { sizes: '360px', alt: '', cls: 'sk-illo h-know__leaf' })}<img class="h-know__logo" src="/assets/brand/logo.webp" alt="" width="700" height="700" loading="lazy" decoding="async" data-depth="0.08"></div>
<div class="h-know__card glass" data-reveal>
<h2 id="h-know-h" class="display h-know__h">${fixLinks(kH2.html)}</h2>
${P(kP, 'lede')}
${btns(kLinks, ['btn--gold'])}
<span class="sr-only">${esc(kImg.alt)}</span>
</div>
</div>
</section>`;

  // ---------- 11. noon to 8 ----------
  const nPs = ofType(noon, 'p');
  const nH2 = nth(noon, 'h2', 0, 'noon h2');
  const nLinks = nth(noon, 'links', 0, 'noon links').items;
  const noonHtml = `<section class="h-noon band band--paper" aria-labelledby="h-noon-h">
<div class="wrap wrap--wide h-noon__grid">
<div class="h-noon__copy">
<p class="kicker" data-reveal>${fixLinks(must(nPs[0], 'noon kicker').html)}</p>
<h2 id="h-noon-h" class="h-noon__h" data-reveal><span class="sk-circled">${fixLinks(nH2.html)}${skCircle()}</span></h2>
${P(must(nPs[1], 'noon p'), 'lede')}
${btns(nLinks, ['btn--gold', 'btn--ghost'])}
${P(must(nPs[2], 'noon licence'), 'h-noon__lic')}
</div>
<figure class="h-noon__photo sk-tape" style="--tilt:2.5deg" data-reveal="zoom">${img({ src: '/assets/photos/sign.webp', alt: 'The My Dealer sign lit at night on the brick storefront in Bayport' }, { sizes: '(min-width: 1024px) 42vw, 100vw' })}<figcaption>${fixLinks(must(fPs[9], 'landmarks').html.split('. ').slice(2, 3).join('') + '.')}</figcaption></figure>
</div>
</section>`;

  const main = [heroHtml, marqueeHtml, catsHtml, waysHtml, dealerHtml, quoteHtml, flowerHtml, vapesHtml, storeHtml, knowHtml, noonHtml].join('\n');
  return [{
    path: '/',
    html: page({
      ctx, path: '/', title: H.title, description: H.description, canonical: H.canonical, og: H.og, jsonld: H.jsonld,
      bodyClass: 'is-home', main,
      preload: [{ href: '/assets/photos/film-poster.jpg', as: 'image', fetchpriority: 'high' }],
    }),
  }];
}
