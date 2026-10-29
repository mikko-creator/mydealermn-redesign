# Media: what is real and what is generated

This redesign of mydealermn.com uses two kinds of imagery. Keep them apart when you edit the site.

## 1. My Dealer's own media (real)

- `assets/photos/`: My Dealer's own photographs of the Bayport store (outside views, the build-out, the
  finished floor, the parking lot, the restroom), the poster frame of the brand film, and the four thumbnails of
  the Potamentary film linked from the company page. Names are kept from the live site. One large photo
  (`parking-after.webp`) was re-encoded as WebP at quality 80 to lighten it; nothing else was changed.
- `assets/media/my-dealer-comes-to-life.mp4` and `-mobile.mp4`: My Dealer's own brand film (the dealer character
  comes to life). It stays the home hero film, as on the live site.
- `assets/brand/`: My Dealer's logo files. `dealer-cut.png` is the logo character cut from the client's own logo
  with the outside black made transparent.

Alt text for these files is in `src/content/images.json` (`photos`, `media`). Where the live site already had alt
text, it is reused.

## 2. Generated media (AI-generated, illustrative)

Every file in `assets/generated/`, plus `assets/media/loop-smoke.mp4`, `loop-smoke-sm.mp4` and `loop-smoke.jpg`,
is **AI-generated and illustrative**. None of them is a photograph or recording of My Dealer's store, staff,
customers, products or brands, and none stands in for one. They are mood and category illustrations.

All generated imagery follows the same rules: no people, faces, hands or bodies; no smoking, vaping or eating; no
text, letters, numbers, labels, logos or brand marks (jars, cans and the vape device are blank); no candy, party or
luxury cues.

### Stills (model family: FLUX1.1 [pro] ultra, run on fal.ai)

| id | aspect | what it depicts |
|---|---|---|
| `g-bud-macro` | 16:9 | Macro of a cured cannabis flower bud with frosty trichomes, warm gold rim light, soft smoke, near-black ground |
| `g-deli-jars` | 3:2 | Three blank clear glass jars with white lids, filled with cured flower, on a dark wooden counter |
| `g-prerolls` | 3:2 | Three empty cone-shaped pre-roll papers with white filter tips on a dark slate tray, beside loose flower crumbs |
| `g-edibles` | 3:2 | Four plain square amber gummies in a small cream stoneware dish on dark marble |
| `g-vape` | 3:2 | An unbranded matte black all-in-one vape device with a small amber oil window on a dark stone ledge |
| `g-beverage` | 3:2 | Three blank, unlabelled matte cans (sage, cream, charcoal) with condensation on dark marble |
| `g-smoke` | 16:9 | Wisps of pale smoke on near-black with a faint warm glow (a texture) |
| `s-leaf` | 4:5 | Line drawing of a cannabis fan leaf on white paper |
| `s-bud` | 4:5 | Ink sketch of a cannabis flower bud on its stem, with wordless leader lines ending in dots, on white paper |
| `s-jar` | 4:5 | Hatched sketch of an empty apothecary jar on white paper |
| `s-hat` | 1:1 | Cross-hatched ink sketch of a fedora with sunglasses beside it (no face, no person) on white paper |

The four sketches were cleaned after generation: converted to neutral grey, the paper flattened to pure white (so
they blend cleanly onto the cream and ink backgrounds), and the three tall ones cropped to 4:5.

### Motion (model family: Kling 3.0 Turbo image-to-video, run on Higgsfield)

`loop-smoke.mp4` (1920 px wide) and `loop-smoke-sm.mp4` (900 px wide) are a 10-second silent loop: the
`g-smoke` still animated into drifting smoke with a slow camera push, then played forward and in reverse so the
end meets the start without a jump. `loop-smoke.jpg` is its first frame, used as the poster.

## 3. How the AI label is embedded

- JPEG stills in `assets/generated/` and the poster `assets/media/loop-smoke.jpg`: an XMP packet in an APP1
  segment with the IPTC digital source type `trainedAlgorithmicMedia`
  (`http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia`), written by `tools/ai-label.mjs`.
- The WebP variants the build makes from them (`/assets/img/<id>-<width>.webp`): the same XMP packet, attached
  with `webpmux`. Every `<img>` of a generated image also carries `data-ai="generated"`.
- The MP4 loops: the `comment` and `description` container tags state that the clip is AI-generated illustrative
  motion and carry the same IPTC digital source type URI.
- Check any file with `node tools/ai-label.mjs verify <file or folder>`.

The prompt, seed and request id of every generated still and clip are kept in the project's generation record
with the source files.
