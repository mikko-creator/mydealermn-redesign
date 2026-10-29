# My Dealer: website redesign concept

A redesign concept for [mydealermn.com](https://mydealermn.com/), the website of My Dealer, a licensed adult-use
cannabis dispensary at 243 3rd Street North in Bayport, Minnesota. It was built as a pitch and is not affiliated
with or endorsed by My Dealer LLC.

**Preview (noindex):** https://mikko-creator.github.io/mydealermn-redesign/

## What it is

- **My Dealer's own content, word for word.** Every page of mydealermn.com was captured on 2026-10-29 and rebuilt from
  that capture. `tools/parity.mjs` checks that every captured heading, paragraph, list item and FAQ answer appears on
  the rebuilt page.
- **A bigger site architecture.** The navigation, mega menus, footer columns, page types and URL patterns follow the
  structure of a large multi-state dispensary operator's site. Its added page types are filled only with My Dealer's
  own facts: a store page for Bayport, Minnesota and all-locations hubs, deals, rewards, a dispensary guide, a
  Minnesota law summary taken from My Dealer's own FAQ, a blog hub of My Dealer's guides, and a site map.
- **"Sketchbook Noir" design.** Frosted glass over a designer's sketchbook, in My Dealer's own colours (ink, cream,
  gold and sage) and type (Fraunces, Figtree, Montserrat). It has three depth layers, with the dealer character and
  photos breaking out of their sections. Sketch lines draw themselves as you scroll, and there are reveal animations
  and hover states. See [docs/DESIGN.md](docs/DESIGN.md).
- **Imagery.** The client's photos and brand film are kept. AI-generated illustrative stills and a motion loop are
  added and labelled as AI-generated; see [docs/MEDIA.md](docs/MEDIA.md).

The live menu and preorder stay on My Dealer's existing menu at https://mydealermn.com/bayport.

## Build and run locally

Requirements: Node 18+, plus `cwebp` (and optionally `webpmux`) on PATH for the WebP image variants.

```bash
node src/build.mjs                        # writes dist/
node tools/serve.mjs --root dist --port 8080 --not-found 404.html
# open http://127.0.0.1:8080/
```

Checks: `node tools/link-check.mjs --dir dist` (internal links) and `node tools/parity.mjs --dir dist` (captured text).

## Layout

- `src/content/`: the captured pages as ordered content blocks (`pages/*.json`), store facts (`site.json`), the
  navigation and footer (`ia.json`), and the image registry.
- `src/theme/`: the templates (shell, home, captured pages, new page types, site map).
- `src/styles/`, `src/scripts/`: the design system and its motion.
- `assets/`: the client's photos, brand art and film, and the generated images and loop.
- `tools/`: the build, link, parity and preview tools.
