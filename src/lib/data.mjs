// data.mjs - load every content file once. ctx.site (store facts), ctx.ia (nav, footer, blog map), ctx.content
// (captured pages by slug: home, faq, flower, ...; each { path, title, description, canonical, og, jsonld, sections }),
// ctx.images (src/content/images.json: photo + media registry written by the IMAGERY lane; {} until it exists).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './paths.mjs';

const readJson = (rel, fallback) => {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback;
};

export function loadAll() {
  const site = readJson('src/content/site.json');
  const ia = readJson('src/content/ia.json');
  const images = readJson('src/content/images.json', { photos: {}, media: {} });
  const content = {};
  const dir = path.join(ROOT, 'src/content/pages');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) content[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return { site, ia, images, content };
}
