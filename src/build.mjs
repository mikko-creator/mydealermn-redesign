// build.mjs - My Dealer redesign pitch: src/content/*.json -> static site in dist/ (or --out <dir> for a lane).
//   MSYS_NO_PATHCONV=1 node src/build.mjs [--out dist]
// Node builtins + cwebp (webpmux optional) on PATH. Theme modules in src/theme/index.mjs MODULES each export
// render(ctx) -> [{ path, html }]; path "/x/" writes x/index.html, "/404.html" writes 404.html. Exit 1 on a missing
// image, a template error or a duplicate path. Warnings: h1 count != 1, no <main id="main">, empty description.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/paths.mjs';
import { loadAll } from './lib/data.mjs';
import { scanGenerated, writeVariants, imageErrors } from './lib/images.mjs';
import { MODULES } from './theme/index.mjs';
import { CSS_ORDER } from './theme/shell.mjs';

const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const OUT = path.resolve(ROOT, argOf('out', 'dist'));
if (!OUT.startsWith(ROOT + path.sep)) { console.error('refusing --out outside the project: ' + OUT); process.exit(2); }
const t0 = Date.now();
const fail = (msg) => { console.error('BUILD FAILED: ' + msg); process.exit(1); };

const data = loadAll();
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyDir(src, dst, filter = () => true) {
  const s = path.join(ROOT, src);
  if (!fs.existsSync(s)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(s, { withFileTypes: true })) {
    if (e.isDirectory()) { n += copyDir(path.join(src, e.name), path.join(dst, e.name), filter); continue; }
    if (!filter(e.name)) continue;
    fs.mkdirSync(path.join(OUT, dst), { recursive: true });
    fs.copyFileSync(path.join(s, e.name), path.join(OUT, dst, e.name));
    n++;
  }
  return n;
}

// ---------- static assets ----------
const cssFiles = CSS_ORDER.filter((f) => fs.existsSync(path.join(ROOT, 'src/styles', f + '.css')));
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
for (const f of cssFiles) fs.copyFileSync(path.join(ROOT, 'src/styles', f + '.css'), path.join(OUT, 'assets/css', f + '.css'));
const extraCss = fs.readdirSync(path.join(ROOT, 'src/styles')).filter((f) => f.endsWith('.css') && !CSS_ORDER.includes(f.replace(/\.css$/, '')));
if (extraCss.length) console.warn('warning: stylesheets not in CSS_ORDER are not linked: ' + extraCss.join(', '));
fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
const jsFiles = fs.readdirSync(path.join(ROOT, 'src/scripts')).filter((f) => f.endsWith('.js'));
for (const f of jsFiles) fs.copyFileSync(path.join(ROOT, 'src/scripts', f), path.join(OUT, 'assets/js', f));
const copied = {
  brand: copyDir('assets/brand', 'assets/brand', (n) => /\.(png|webp|svg|jpg|ico)$/i.test(n)),
  fonts: copyDir('assets/fonts', 'assets/fonts', (n) => /\.(woff2?|ttf)$/i.test(n)),
  media: copyDir('assets/media', 'assets/media', (n) => /\.(mp4|webm|webp|jpg|png)$/i.test(n)),
  photos: copyDir('assets/photos', 'assets/photos', (n) => /\.(webp|jpe?g|png|avif|svg)$/i.test(n)),
};
for (const f of ['favicon.ico', 'favicon-32.png', 'favicon-48.png', 'apple-touch-icon.png']) {
  const s = path.join(ROOT, 'assets/brand', f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(OUT, f));
}
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

// ---------- images ----------
fs.mkdirSync(path.join(ROOT, 'assets/generated'), { recursive: true });
scanGenerated();

// ---------- render ----------
const pages = new Map();
const ctx = { ...data, cssFiles, jsFiles, out: OUT, pages };
for (const name of MODULES) {
  const file = path.join(ROOT, 'src/theme', name + '.mjs');
  if (!fs.existsSync(file)) { console.warn('warning: template module not written yet: ' + name); continue; }
  let mod;
  try { mod = await import('./theme/' + name + '.mjs'); } catch (e) { fail(`template ${name} failed to load: ${e.stack || e}`); }
  if (typeof mod.render !== 'function') fail('template ' + name + ' exports no render(ctx)');
  let out;
  try { out = await mod.render(ctx); } catch (e) { fail(`template ${name} threw: ${e.message}${/missing image/.test(e.message) ? '' : '\n' + e.stack}`); }
  for (const p of out || []) {
    if (!p || typeof p.path !== 'string' || typeof p.html !== 'string') fail('template ' + name + ' returned a page without path/html');
    if (pages.has(p.path)) fail(`duplicate page path ${p.path} (${pages.get(p.path).from} and ${name})`);
    pages.set(p.path, { ...p, from: name });
  }
}
const errs = imageErrors();
if (errs.length) fail([...new Set(errs)].join('\n  '));

// ---------- live-menu links ----------
// mydealermn.com/bayport (the live menu) answered 403 to every connection this pitch could test from on 2026-10-29
// (scripts, the operator's real Chrome, a US fetch service), so no page links there directly: every <a> to it, from a
// template or from captured copy, is routed to the store menu page (menu.mjs), category URLs to that page's category
// anchors, with the new-tab target and the external-link icon removed. Only links marked data-keep-live (the menu
// page's own labelled buttons) still open the live menu. Link TEXT is never changed.
const MENU_PAGE = '/dispensaries/minnesota/bayport/menu/';
const MENU_ANCHOR = { 'flower-9630': 'flower', 'pre-rolls-10350': 'pre-rolls', 'weed-edibles-9631': 'edibles', 'hemp-edibles-12319': 'edibles', 'vapes-10353': 'vapes', 'hemp-beverages-12318': 'beverages' };
const EXT_ICON = /<svg\b[^>]*>\s*<path d="M7 17 17 7"\/><path d="M8 7h9v9"\/>\s*<\/svg>/g;
let routedLinks = 0;
const unroutedMenu = [];
function routeMenuLinks(html, p) {
  if (!pages.has(MENU_PAGE)) return html;
  return html.replace(/<a\s([^>]*?)href="(?:https:\/\/mydealermn\.com)?\/bayport(?:\/menu\/([a-z0-9-]+))?\/?"([^>]*)>([\s\S]*?)<\/a>/g, (all, pre, cat, post, inner) => {
    if (/data-keep-live/.test(pre + post)) return all;
    if (cat && !MENU_ANCHOR[cat]) { unroutedMenu.push(p + ' ' + cat); return all; }
    routedLinks++;
    const attrsOut = (pre + post).replace(/\s?(target|rel)="[^"]*"/g, '').trim();
    // the link no longer leaves the site: drop every "external" mark the templates add (the shell's arrow svg, the
    // pages' sketch arrow .b-sk-ext, the hubs' .r-ext arrow) and any "(opens in a new tab)" screen-reader text
    const innerOut = inner.replace(EXT_ICON, '')
      .replace(/<svg\b[^>]*class="[^"]*\bext\b[^"]*"[^>]*>[\s\S]*?<\/svg>/g, '')
      .replace(/<span\b[^>]*class="[^"]*\br-ext\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, '')
      .replace(/<span\b[^>]*>\s*\(opens in a new tab\)\s*<\/span>/g, '');
    return `<a ${attrsOut ? attrsOut + ' ' : ''}href="${MENU_PAGE}${cat ? '#' + MENU_ANCHOR[cat] : ''}">${innerOut}</a>`;
  });
}
// The licence number (DIS-L24-000241, and the -01 site registration) must never break at its hyphens on a narrow
// screen: wrap each occurrence in visible text (never inside a tag, a <script> or a <style>) in a no-wrap span.
// Text is unchanged.
function nobrLicence(html) {
  return html.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i).map((part, i) => (i % 2
    ? part
    : part.replace(/>([^<]*)</g, (m, txt) => '>' + txt.replace(/DIS-L\d{2}-\d{6}(?:-\d{2})?/g, '<span class="nobr">$&</span>') + '<'))).join('');
}
for (const [p, rec] of pages) rec.html = nobrLicence(routeMenuLinks(rec.html, p));
if (unroutedMenu.length) fail('live-menu category with no anchor on the menu page: ' + [...new Set(unroutedMenu)].join(', '));

const warnings = [];
for (const [p, { html, from }] of pages) {
  const rel = p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1);
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warnings.push(`${p} (${from}): ${h1} <h1>`);
  if (!/<main id="main"/.test(html)) warnings.push(`${p} (${from}): no <main id="main">`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) warnings.push(`${p} (${from}): empty meta description`);
}
if (!pages.has('/404.html')) warnings.push('no /404.html page rendered');

const iv = await writeVariants(OUT);
const errs2 = imageErrors();
if (errs2.length) fail([...new Set(errs2)].join('\n  '));
for (const w of warnings) console.warn('warning: ' + w);
console.log(`built ${pages.size} pages -> ${path.relative(ROOT, OUT) || '.'} | css ${cssFiles.join(',')} | js ${jsFiles.join(',')} | brand ${copied.brand}, fonts ${copied.fonts}, media ${copied.media}, photos ${copied.photos} | img variants ${iv.copied} (encoded ${iv.encoded}, ai-label ${iv.labelled ? 'yes' : 'no'}) | live-menu links routed to the menu page ${routedLinks} | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
