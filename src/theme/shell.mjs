// shell.mjs - page wrapper: <head>, promo bar, header + mega menus, footer, age gate (FOUNDATION owns this file).
//   page({ ctx, path, title, description, canonical, og, jsonld, bodyClass, main, crumbs, scripts, preload })
//     main     the page's <main> INNER html (page() wraps it in <main id="main">)
//     crumbs   [[href, label], ...] (last = current page, no link) -> breadcrumb nav above main
//     jsonld   array of objects -> <script type="application/ld+json">
//     scripts  extra script file names under /assets/js/ (site.js is always loaded)
//     preload  [{ href, as, type, media, imagesrcset, imagesizes, fetchpriority }] -> <link rel="preload">
// Every word in the chrome comes from ctx.site / ctx.ia (My Dealer's own); the structure is the adopted one.
import { esc, escA, attrs, href, linkAttrs, img, gimg, skDefs } from './util.mjs';

export const CSS_ORDER = ['tokens', 'base', 'components', 'sketch', 'motion', 'shell', 'home', 'blocks', 'pages', 'hubs', 'mobile', 'fix'];

const FONTS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Montserrat:wght@500;600;700&display=swap';

// small line icons (24x24, stroke = currentColor)
const ICON = {
  ext: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z"/><path d="M17.5 6.5h.01"/>',
  x: '<path d="M4 4l6.8 9.1L4.3 20H6l5.6-6 4.5 6H20l-7.1-9.5L19 4h-1.7l-5.2 5.6L8 4Z"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  google: '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 12H12"/>',
};
export const icon = (name, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[name] || ''}</svg>`;

export function crumbsHtml(crumbs) {
  if (!crumbs || !crumbs.length) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([h, l], i) => (i < crumbs.length - 1 ? `<li><a href="${escA(href(h))}">${esc(l)}</a></li>` : `<li aria-current="page">${esc(l)}</li>`)).join('')}</ol></nav>`;
}

const isExt = (u) => /^https?:\/\//i.test(String(u));
const extMark = (u) => (isExt(u) ? icon('ext', 'ico--ext') : '');

// ---------- header ----------
function megaCard(kind, ctx) {
  const st = ctx.site.store;
  if (kind === 'Explore') {
    const intro = ctx.site.deliFlower.intro.split('. ')[0] + '.';
    return `<a class="mega__card"${linkAttrs('/flower')}><span class="mega__media">${gimg('g-deli-jars', { sizes: '300px', alt: '' })}</span><span class="mega__card-k">Flower</span><span class="mega__card-t">${esc(intro)}</span></a>`;
  }
  if (kind === 'Resources') {
    return `<a class="mega__card mega__card--sketch"${linkAttrs('/cannabis-101')}><span class="mega__media mega__media--sketch">${gimg('s-bud', { sizes: '300px', alt: '', cls: 'sk-illo' })}</span><span class="mega__card-k">Cannabis 101</span><span class="mega__card-t">Know what you are buying.</span></a>`;
  }
  return `<a class="mega__card"${linkAttrs(st.path)}><span class="mega__media">${img({ src: '/assets/photos/exterior-front.webp', alt: '' }, { sizes: '300px' })}</span><span class="mega__card-k">${esc(st.name)}</span><span class="mega__card-t">${esc(st.address.street)}, ${esc(st.address.city)}, ${esc(st.address.region)} ${esc(st.address.postal)}</span></a>`;
}

function navHtml(ctx, path) {
  const items = ctx.ia.nav.map((it, n) => {
    if (!it.mega) {
      const cur = !isExt(it.href) && href(it.href) === path ? ' aria-current="page"' : '';
      return `<li class="nav__item"><a class="nav__link"${linkAttrs(it.href)}${cur}><span>${esc(it.label)}</span>${extMark(it.href)}</a></li>`;
    }
    const id = 'mega-' + it.label.toLowerCase();
    const groups = it.mega.map((g) => `<div class="mega__group"><p class="mega__h">${esc(g.group)}</p><ul class="mega__links">${g.links.map(([h, l]) => `<li><a${linkAttrs(h)}${!isExt(h) && href(h) === path ? ' aria-current="page"' : ''}><span>${esc(l)}</span>${extMark(h)}</a></li>`).join('')}</ul>${g.note ? `<p class="mega__note">${esc(g.note)}</p>` : ''}</div>`).join('');
    return `<li class="nav__item has-mega" data-mega>
<button class="nav__link nav__trigger" type="button" aria-expanded="false" aria-controls="${id}"><span>${esc(it.label)}</span>${icon('chev', 'ico--chev')}</button>
<div class="mega" id="${id}" data-mega-panel><div class="mega__panel glass wrap wrap--wide"><div class="mega__grid mega__grid--${it.mega.length}">${groups}</div>${megaCard(it.label, ctx)}</div></div>
</li>`;
  }).join('\n');
  const [ctaHref, ctaLabel] = ctx.ia.cta;
  const pk = ctx.ia.promo.pickup;
  return `<nav class="nav" id="site-nav" aria-label="Main" data-nav>
<div class="nav__drawer-head"><span class="ui-label">Menu</span><button class="nav__close" type="button" data-nav-close>${icon('close')}<span class="sr-only">Close menu</span></button></div>
<ul class="nav__list">
${items}
</ul>
<div class="nav__drawer-foot">
<a class="btn btn--gold"${linkAttrs(ctaHref)}>${esc(ctaLabel)}${icon('ext')}</a>
<a class="nav__pickup"${linkAttrs(pk.href)}>${icon('pin')}<span>${esc(pk.label)} <strong>${esc(pk.store)}</strong></span></a>
</div>
</nav>`;
}

function headerHtml(ctx, path) {
  const b = ctx.site.brand;
  const pr = ctx.ia.promo;
  const [ctaHref, ctaLabel] = ctx.ia.cta;
  return `<div class="topbar">
<div class="promo"><div class="promo__inner wrap wrap--wide"><p class="promo__text"><span class="promo__msg">${icon('tag')}<span>${esc(pr.text)}</span></span></p><a class="promo__link"${linkAttrs(pr.link[0])}>${esc(pr.link[1])}${icon('arrow')}</a></div></div>
<div class="utility"><div class="utility__inner wrap wrap--wide"><p class="utility__license">${esc(ctx.site.licenseBar)}</p><a class="utility__pickup"${linkAttrs(pr.pickup.href)}>${icon('pin')}<span>${esc(pr.pickup.label)} <strong>${esc(pr.pickup.store)}</strong></span></a></div></div>
</div>
<header class="site-header" data-header>
<div class="site-header__inner wrap wrap--wide">
<a class="brand" href="/" aria-label="${escA(b.name)} home">${img({ src: b.logo, alt: '' }, { cls: 'brand__logo', eager: true, sizes: '48px' })}<span class="brand__words"><span class="brand__name">${esc(b.name)}</span><span class="brand__sub">${esc(b.headerSub)}</span></span></a>
${navHtml(ctx, path)}
<a class="btn btn--gold header-cta"${linkAttrs(ctaHref)}>${esc(ctaLabel)}${icon('ext')}</a>
<button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>${icon('menu')}<span class="sr-only">Open menu</span></button>
</div>
</header>
<div class="nav-scrim" data-nav-scrim hidden></div>`;
}

// ---------- footer ----------
function footerHtml(ctx) {
  const s = ctx.site;
  const st = s.store;
  const f = s.footer;
  const ia = ctx.ia.footer;
  const linkList = (arr) => `<ul class="footer__links">${arr.map(([h, l]) => `<li><a${linkAttrs(h)}>${esc(l)}</a></li>`).join('')}</ul>`;
  const social = s.social.map((x) => `<a class="footer__social"${linkAttrs(x.url, { 'aria-label': x.label })}>${icon(x.name.toLowerCase())}</a>`).join('');
  const areas = s.areas.map((a) => [a.path, a.name]);
  const cats = s.categories.map((c) => [c.path, c.name]);
  return `<footer class="site-footer band band--night">
<div class="wrap wrap--wide">
<div class="footer__top">
<div class="footer__brand">
<a class="brand brand--footer" href="/">${img({ src: s.brand.logo, alt: '' }, { cls: 'brand__logo', sizes: '56px' })}<span class="brand__words"><span class="brand__name">${esc(s.brand.name)}</span><span class="brand__sub">${esc(s.brand.footerSub)}</span></span></a>
<p class="footer__blurb">${esc(s.brand.blurb)}</p>
<p class="footer__addr">${esc(st.address.street)}<br>${esc(st.address.city)}, ${esc(st.address.region)} ${esc(st.address.postal)}</p>
<p class="footer__tel"><a href="tel:${escA(st.tel)}">${icon('phone')}<span>${esc(st.phone)}</span></a></p>
<div class="footer__socials">${social}</div>
<a class="footer__bbb"${linkAttrs(st.bbbUrl, { rel: 'nofollow noopener' })}><img src="${escA(st.bbbSeal)}" alt="${escA(st.bbbAlt)}" width="250" height="52" loading="lazy" decoding="async"></a>
</div>
<div class="footer__cols">
<nav class="footer__col footer__col--primary" aria-label="Footer">${linkList(ia.primary)}</nav>
<div class="footer__col"><h2 class="footer__h">More information</h2>${linkList(ia.moreInfo)}</div>
<div class="footer__col"><h2 class="footer__h">Explore</h2>${linkList(f.explore)}</div>
<div class="footer__col"><h2 class="footer__h">Connect</h2>${linkList(f.connect)}</div>
</div>
</div>
<div class="footer__mid">
<div class="footer__col"><h2 class="footer__h">Areas we serve</h2>${linkList(areas)}</div>
<div class="footer__col"><h2 class="footer__h">Shop by category</h2>${linkList(cats)}</div>
<div class="footer__col footer__licenses"><h2 class="footer__h">${esc(ia.licensesHeading)}</h2><p>${esc(st.licenseLine)}</p><p class="footer__licbar">${esc(s.licenseBar)}</p></div>
</div>
<p class="footer__warning">${esc(f.warning)}</p>
<div class="footer__legal"><span>${esc(f.copyright)}</span><span>${esc(f.legalLine)} <a${linkAttrs('/privacy')}>Privacy policy</a></span></div>
</div>
</footer>`;
}

// ---------- age gate (D7): hidden by default, site.js opens it when mdl-age-ok is not set; never blocks without JS ----------
function gateHtml(ctx) {
  const warn = ctx.site.footer.warning.replace(/^Warning:\s*/, '').split('. ')[0] + '.';
  return `<div class="age-gate" data-age-gate hidden>
<div class="age-gate__card glass" role="dialog" aria-modal="true" aria-labelledby="age-gate-q" aria-describedby="age-gate-d">
<img class="age-gate__logo" src="/assets/brand/dealer-cut.png" alt="" width="458" height="388" loading="lazy" decoding="async">
<p class="kicker">${esc(ctx.site.brand.name)} · ${esc(ctx.site.brand.headerSub)}</p>
<h2 class="age-gate__q" id="age-gate-q">Are you 21 or older?</h2>
<p class="age-gate__d" id="age-gate-d">${esc(ctx.site.store.age)}</p>
<div class="btn-row age-gate__actions"><button class="btn btn--gold" type="button" data-age-yes>Yes</button><button class="btn btn--ghost" type="button" data-age-no>No</button></div>
<p class="age-gate__no" data-age-msg hidden>${esc(warn)}</p>
</div>
</div>`;
}

export function page({ ctx, path, title, description, canonical, og = {}, jsonld = [], bodyClass = '', main, crumbs, scripts = [], preload = [] }) {
  const css = (ctx.cssFiles || []).map((f) => `<link rel="stylesheet" href="/assets/css/${f}.css">`).join('\n');
  const ld = (jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (preload || []).map((p) => `<link rel="preload"${attrs(p)}>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(description)}">
${canonical ? `<link rel="canonical" href="${escA(canonical)}">` : ''}
${Object.entries(og || {}).map(([k, v]) => `<meta property="${escA(k)}" content="${escA(v)}">`).join('\n')}
<meta name="theme-color" content="#121310">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
${pre}
${css}
<script>document.documentElement.classList.add('js');</script>
${ld}
</head>
<body${attrs({ class: bodyClass })}>
${skDefs()}
<a class="skip" href="#main">Skip to main content</a>
${headerHtml(ctx, path)}
${crumbs && crumbs.length ? `<div class="crumbs-bar"><div class="wrap wrap--wide">${crumbsHtml(crumbs)}</div></div>` : ''}
<main id="main">
${main}
</main>
${footerHtml(ctx)}
${gateHtml(ctx)}
<script src="/assets/js/site.js" defer></script>
${scripts.map((s) => `<script src="/assets/js/${s}" defer></script>`).join('\n')}
</body>
</html>`;
}
