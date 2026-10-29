# Design system: "Sketchbook Noir"

The redesign keeps My Dealer's own brand (the noir stick-figure dealer in a fedora and sunglasses, near-black ink,
cream paper, gold and sage accents, a dry and honest voice) and lays it out on the information architecture of a
large multi-state dispensary operator's site. The look is a designer's sketchbook seen through frosted glass: three
planes of depth, hand-drawn strokes that draw themselves as you scroll, and the client's own film and photographs.

## Three planes

1. **Grounds (back).** Full-bleed bands alternate between *night* (ink `#121310` with soft gold and sage glows, a faint
   graphite grid and grain) and *paper* (cream paper with a faint engineering-paper grid and grain). The grid fades out
   toward the middle of each band, so body text always sits on a calm ground.
2. **Glass (middle).** Frosted panels (`backdrop-filter: blur + saturate`, a 1px edge, an inset top highlight, a deep
   soft shadow, large radius). Glass is used only where something varied sits behind it: the header and mega menus
   over the film and page, the hero panel over the brand film, the "three ways to shop" cards over a slow smoke loop,
   dialogs. Long reading uses plain surfaces.
3. **Front.** At most one or two objects per page cross a section seam: on the home page the dealer character climbs
   out of the hero into the ribbon below, and the taped storefront photo crosses into the band above it. The recipe:
   the band's backdrop layers live in an inner clip layer, the band itself stays `overflow: visible` and stacks above
   the next band, and the object is positioned with a negative offset.

## Sketch layer

Hand-drawn SVG strokes (round caps, current colour, a shared pencil-roughness filter defined once per page) for
underlines under a key word, loops around a word, arrows, crop and registration marks around photos, and the route
map on the home page, redrawn as a pencil sketch from the site's own map with the same labels. Every stroke draws on
when it scrolls into view. Short handwritten notes use the hand face (gold on night, graphite on paper) and carry
only decoration or My Dealer's own words. Pencil illustrations sit on paper with a multiply blend, and on night grounds
inverted with a screen blend.

## Type

- **Fraunces** for display and headings, with italic accents (one accent per heading at most).
- **Figtree** for body text.
- **Montserrat** in small capitals for UI labels, kickers, navigation and buttons.
- **Caveat** for sketch annotations.

## Colour

Ink `#121310`, ink-2 `#1c1e18`, pine `#2f3d3a`, cream `#fffaf1`, paper `#f3eee4`, gold `#e2b65a`, sage `#9fb07a`,
graphite `#6f6a60`. Body text keeps a contrast of at least 4.5:1 on its ground.

## Motion

- Scroll reveals (fade and lift, staggered); a fail-safe makes every reveal visible after 2.5 seconds.
- Sketch strokes draw on when revealed.
- Gentle parallax on a few decorative objects (transform only, desktop and tablet).
- Pointer tilt on a few glass cards (fine pointers only).
- A slow marquee ribbon of the site's own short phrases.
- Hover: glass lifts, links grow a drawn underline, photos straighten or zoom slightly.
- The hero film has a pause button; films pause off-screen.
- `prefers-reduced-motion: reduce` turns all of it off: everything is shown, drawn and still, and the films show
  their posters.

## Header and navigation

Promo bar (the store's current announcement and a deals link), a thin line with the licence number and
"Pick up at My Dealer Bayport", then a frosted header: logo, the main navigation in the adopted order, and a
"View the menu" button to the live menu. From 1024px wide every destination is reachable from the bar: each mega
menu is a glass panel with grouped links and one image card. Below 1024px the same navigation becomes a drawer.
Menus open on hover with intent and a close delay, open on click or Enter, and close on Escape.

## Components (class names)

| Class | Use |
|---|---|
| `.wrap` `.wrap--wide` `.wrap--narrow` | centred content widths |
| `.band` `.band--night` `.band--paper` `.band__clip` `.band--over` | full-bleed sections, their backdrop layer, stacking above the next band |
| `.glass` `.glass--night` `.glass--milk` `.glass--lift` | frosted panels |
| `.btn` `.btn--gold` `.btn--ghost` `.btn--glass` `.btn--sm` `.btn-row` | buttons |
| `.kicker` `.display` `.lede` `.ui-label` | type roles |
| `.scribble` | a word with a drawn underline |
| `.sk-note` | handwritten annotation |
| `.sk-frame` `.sk-tape` | photo with crop marks; taped, tilted photo |
| `.sk-circled` `.sk-arrow` `.sk-illo` | drawn loop, drawn arrow, pencil illustration |
| `.chip` `.chip-row` `.card` `.prose` `.crumbs` | chips, plain cards, long reading, breadcrumbs |
| `.img-slot` | placeholder while an image is pending |
| `.protrude` | an object that crosses a section seam |
| `[data-reveal]` `[data-draw]` `[data-depth]` `[data-tilt]` `[data-marquee]` | motion hooks |

Template helpers return the hand-drawn SVG pieces: an underline, a loop, an arrow, a frame outline and free paths.

## Accessibility

One heading level one per page, landmarks, real links and buttons, a skip link, visible focus rings, alt text on
every meaningful image (decorative images have empty alt), nothing essential behind hover only, keyboard support in
the menus, drawer and age gate, and the reduced-motion behaviour above. The 21+ age gate never blocks the page when
JavaScript is off.
