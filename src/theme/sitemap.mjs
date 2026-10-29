// sitemap.mjs - /site-map/ (hubs lane), rendered LAST: lists every page in ctx.pages, grouped the way the adopted
// architecture groups its sitemap (Shop & Explore, Dispensaries & areas, Resources, Company, Legal). Labels come from
// ia.json / site.json link labels where one exists, otherwise from the page's own <title> (text before " | ").
import { esc, escA, linkAttrs, stripTags } from './util.mjs';
import { page } from './shell.mjs';

const PATH = '/site-map/';
const GROUPS = ['Shop & Explore', 'Dispensaries & areas', 'Resources', 'Company', 'Legal'];

const norm = (p) => {
  const s = String(p || '').split(/[?#]/)[0];
  if (!s.startsWith('/')) return null;
  if (/\.[a-z0-9]{2,5}$/i.test(s)) return s;
  return s.endsWith('/') ? s : s + '/';
};

function groupOf(p) {
  if (p === '/' || /^\/(shop|flower|pre-rolls|edibles|vapes|beverages|rewards)\/$/.test(p) || p === '/dispensaries/minnesota/deals/') return 'Shop & Explore';
  if (p.startsWith('/dispensaries/') || /^\/(stillwater|oak-park-heights|hudson-wi|river-falls-wi|somerset-wi|new-richmond-wi|wisconsin)\/$/.test(p)) return 'Dispensaries & areas';
  if (/^\/(company|build|jobs|contact)\/$/.test(p)) return 'Company';
  if (/^\/(privacy|site-map)\/$/.test(p)) return 'Legal';
  return 'Resources';
}

// preferred order inside a group (anything not listed follows in path order)
const ORDER = ['/', '/shop/', '/dispensaries/minnesota/deals/', '/rewards/', '/flower/', '/pre-rolls/', '/edibles/', '/vapes/', '/beverages/',
  '/dispensaries/', '/dispensaries/minnesota/', '/dispensaries/minnesota/bayport/', '/stillwater/', '/oak-park-heights/', '/hudson-wi/', '/river-falls-wi/', '/somerset-wi/', '/new-richmond-wi/', '/wisconsin/',
  '/dispensary-guides/', '/cannabis-laws-by-state/', '/cannabis-laws-by-state/minnesota/', '/cannabis-101/', '/faq/', '/blog/',
  '/company/', '/build/', '/jobs/', '/contact/', '/privacy/', '/site-map/'];

export async function render(ctx) {
  const S = ctx.site;
  const ia = ctx.ia;
  // labels: ia nav + megas + footer, site.json categories and areas, store
  const label = new Map();
  const put = (u, l) => { const p = norm(u); if (p && l && !label.has(p)) label.set(p, stripTags(l)); };
  put('/', 'Home');
  put(S.store.path, S.store.name);
  for (const c of S.categories) put(c.path, c.name);
  for (const a of S.areas) put(a.path, a.name);
  for (const n of ia.nav) { if (n.href) put(n.href, n.label); for (const g of n.mega || []) for (const [u, l] of g.links) put(u, l); }
  for (const [u, l] of [...ia.footer.primary, ...ia.footer.moreInfo]) put(u, l);
  for (const c of ia.blogCategories) put(`/blog/${c.slug}/`, c.name);
  put(PATH, 'Sitemap');

  const titleOf = (html) => {
    const m = /<title>([\s\S]*?)<\/title>/i.exec(html || '');
    return m ? stripTags(m[1]).split(' | ')[0].trim() : '';
  };

  const entries = [];
  for (const [p, v] of ctx.pages) {
    if (!p.endsWith('/')) continue; // files (404.html) are not pages to list
    entries.push({ path: p, label: label.get(p) || titleOf(v.html) || p, group: groupOf(p) });
  }
  entries.push({ path: PATH, label: 'Sitemap', group: 'Legal' });
  const rank = (p) => { const i = ORDER.indexOf(p); return i === -1 ? ORDER.length : i; };
  entries.sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path));

  const blogCat = (p) => /^\/blog\/[^/]+\/$/.test(p);
  const groups = GROUPS.map((g) => {
    const items = entries.filter((e) => e.group === g);
    const live = g === 'Shop & Explore' ? `<li><a${linkAttrs(S.store.menuUrl)}>${esc(S.headerCta[1])}<span class="r-ext" aria-hidden="true">&#8599;</span><span class="r-sr"> (opens in a new tab)</span></a></li>` : '';
    return `<section class="glass glass--milk r-sm__group" data-reveal aria-labelledby="r-sm-${escA(g.toLowerCase().replace(/[^a-z]+/g, '-'))}">
      <h2 class="r-sm__title" id="r-sm-${escA(g.toLowerCase().replace(/[^a-z]+/g, '-'))}">${esc(g)}</h2>
      <ul class="r-sm__list">${items.map((e) => `<li${blogCat(e.path) ? ' class="r-sm__sub"' : ''}><a${linkAttrs(e.path, e.path === PATH ? { 'aria-current': 'page' } : {})}>${esc(e.label)}</a></li>`).join('')}${live}</ul>
    </section>`;
  }).join('\n');

  const title = 'Sitemap | My Dealer';
  const description = `Every page on mydealermn.com: ${S.brand.blurb}`;
  const main = `
<section class="band band--night r-hero r-hero--sm">
  <div class="band__clip" aria-hidden="true"><span class="r-glow r-glow--gold"></span><span class="r-glow r-glow--sage"></span></div>
  <div class="wrap">
    <div class="glass glass--night r-hero__panel" data-reveal>
      <p class="kicker">${esc(S.brand.name)}</p>
      <h1 class="display r-hero__title">Site<em>map</em></h1>
    </div>
  </div>
</section>
<section class="band band--paper r-sm">
  <div class="wrap r-sm__grid">${groups}</div>
</section>`;
  return [{
    path: PATH,
    html: page({
      ctx, path: PATH, title, description, canonical: 'https://mydealermn.com' + PATH,
      og: { 'og:title': title, 'og:description': description, 'og:type': 'website', 'og:site_name': 'My Dealer', 'og:locale': 'en_US', 'og:url': 'https://mydealermn.com' + PATH },
      bodyClass: 'r-page r-page--sitemap', main, crumbs: [['/', 'Home'], [PATH, 'Sitemap']],
    }),
  }];
}
