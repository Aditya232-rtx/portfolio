# Projects section — hirotos.com/projects pattern

Observed at **1440×900** desktop. Numbers are measured from the live DOM and read
from the site's own stylesheet.

Stack: Next.js + Three.js, a persistent WebGL layer (`.persistent-experience`) that
survives route changes, with the DOM page mounted on top (`.experience-page--projects`).

> Harness note: the site's preloader gates on `document.visibilityState`, which the
> browser pane reports as `hidden`, so it never handed off on its own. I removed the
> preloader overlay and forced the page layer visible to observe the real state.

---

## 1. Design tokens

```css
--background:  #fff
--foreground:  #10100f          /* measured as rgb(11,11,10) */
--muted:       #10100fad        /* ~68% */
--line:        #10100f24        /* ~14% */
--accent:      #8f6200          /* warm brown */

--ui-gutter-x: clamp(14px, 2.6vw, 44px)   /* = 37px @1440 */
--ui-gutter-y: clamp(18px, 2.8vw, 40px)   /* = 40px @1440 */
--ui-edge-x:   var(--ui-gutter-x)
```

Image placeholder background: `rgb(233, 230, 223)` — warm off-white, not grey.

**Light theme, not dark.** Near-black on pure white.

---

## 2. Page shell

```css
.projects-gridzoom {
  height: 100svh;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: clamp(14px, 2.2vw, 30px);
  padding: var(--ui-gutter-y) var(--ui-edge-x);
  overflow: hidden;          /* the page does not scroll */
}
```

The whole page is **one non-scrolling viewport**. Movement comes from the marquee,
not from scrolling.

| element | x | y | size | type |
|---|---|---|---|---|
| `.back-circle-control` | 37 | 40 | 45×45 | black circle, chevron, `border-radius: 999px` |
| `.site-nav` | right 37 | top 40 | — | fixed, column, `gap: 8px`, right-aligned |
| kicker `Projects` | 37 | 187 | 12px | uppercase, `ls .045em`, `rgba(11,11,10,.48)` |
| `h1` line 1 | 37 | 211 | 33.12px | weight 500, `line-height 1.08` |
| `h1` line 2 | 37 | 246 | | **35.5px line step** |
| `h1` line 3 | 37 | 282 | | |
| `h1` line 4 | 37 | 318 | | |
| `.projects-gl-gallery` | 0 | 384 | 1440×402 | |
| meta tags (on hover) | 37 | 819 | 11px | uppercase, `rgba(11,11,10,.52)` |
| project name (on hover) | 37 | 837 | 14px | weight 500, full black |

Nav: `HOME · PROJECTS · ABOUT · CONTACT`, stacked vertically, active item bold.
Back button `:hover { background:#000; transform: scale(0.94) }`.

Intro block width: `min(max(460px, 299px + 10.7333vw), 100%)`.

---

## 3. The marquee — the core of it

```
.projects-gl-gallery        1440×402   width:100vw, margin-left:-gutter, touch-action:none
└ .projects-marquee         inset: 0 calc(-1 * clamp(18px,4vw,72px))   → bleeds past both edges
  └ .projects-marquee__track  position:absolute; top:50%; left:0;
                              display:flex; align-items:center; width:max-content
    ├ .projects-marquee__set  ×3   (identical, for a seamless loop)
    │  └ button.projects-marquee__item  ×8
    │     └ span.projects-marquee__card
    │        └ figure.projects-marquee__figure[data-project-id]
    │           └ img
```

Three identical sets are rendered; the track translates and wraps.
Measured: set width **2290px**, track width **6869px**, gap `clamp(14px, 2.1vw, 32px)` (**31px** @1440).

Cards are **`<button>`**, not links — the click opens an in-page overlay.

### 3.1 Card sizes — an 8-step rhythm

Sizes cycle every 8 items, alternating landscape and portrait with one wide accent:

| position | width | height | @1440 | shape |
|---|---|---|---|---|
| `8n+1, 8n+3, 8n+7` | `max(220px, min(21vw, …))` | `max(154px, min(14.9vw, …))` | 302×215 | landscape |
| `8n+2, 4, 6, 8` | `max(154px, min(13.8vw, …))` | `max(196px, min(18.2vw, …))` | 199×262 | portrait |
| `8n+5` | `max(254px, min(24vw, …))` | `max(150px, min(14vw, …))` | ~345×202 | wide accent |

So the beat is **L · P · L · P · WIDE · P · L · P**, all vertically centred on one axis
(`align-items: center` with `top: 50%`). The varying heights against a shared centre
line is what makes the row feel alive rather than gridded.

### 3.2 Card states

```css
.projects-marquee__item        { opacity: .72;
                                 transition: opacity .26s,
                                             transform .42s cubic-bezier(.2,.8,.2,1); }
.projects-marquee__item:hover  { opacity: 1; }

.projects-marquee__figure      { background: rgb(233,230,223); overflow: hidden; }
.projects-marquee__figure img  { object-fit: cover; transform: scale(1.015);
                                 transition: transform .52s cubic-bezier(.2,.8,.2,1); }
.projects-marquee__item:hover
  .projects-marquee__figure img { transform: scale(1.06); }
```

Cards idle at **72% opacity** and come to full only on hover — the row reads as a
quiet field with one item lit at a time. The image sits at `scale(1.015)` at rest so
the hover push to `1.06` never reveals an edge.

### 3.3 Entrance

```css
.projects-marquee[data-enter-pending="true"] .projects-marquee__card {
  opacity: 0;
  transform: translateY(84px) scale(0.985);
  transform-origin: 50% 100%;
}
```

Cards rise 84px from below, anchored at their bottom edge.

### 3.4 Auto-scroll

The larger `.projects-gridzoom__grid` variant uses the classic duplicate-and-halve loop:

```css
animation: projectsGalleryLoop 38s linear infinite;
@keyframes projectsGalleryLoop { 0% { translate(0,0) } 100% { translate(-50%) } }

.projects-gridzoom__grid:hover { animation-play-state: paused; }
```

**38 s linear, infinite, pauses on hover.**

---

## 4. Hover — the label reveal

On card hover, two lines fade in at the **bottom-left of the viewport**:

```
WEB SITE / DESIGN / FRONT-END DEVELOPMENT        11px, uppercase, ls .045em, 52% black
d.brain                                          14px, weight 500, full black
```

Observed swapping live: hovering the next card changed them to
`WEB SITE / DESIGN / FRONT-END DEVELOPMENT / 3D MODELING` and `PROTO 2026`.

```css
.projects-gridzoom__meta,
.projects-gridzoom__name { opacity: 0; pointer-events: none;
                           transition: opacity .18s,
                                       transform .36s cubic-bezier(.2,.8,.2,1); }
.projects-gridzoom__item:hover        { transform: translateY(-8px); }
.projects-gridzoom__item:hover figure { transform: scale(1.015); }
.projects-gridzoom__item:hover img    { transform: scale(1.08); }
```

A black **`VIEW PROJECT →` pill** also appears, following the cursor with a heavy
lag/spring — it was still catching up a full second after the pointer jumped.

Tags are slash-separated discipline labels, not tech names.

---

## 5. Click — the zoom overlay

```css
.projects-zoom {
  position: fixed; inset: 0; z-index: 70;
  background: #fff; color: rgb(11,11,10);
  padding: var(--ui-gutter-y) var(--ui-edge-x);
  display: grid;
  grid-template-columns: minmax(280px, max(420px, 273px + 11.4333vw))
                         minmax(0, 980px);
  justify-content: center;
  align-items: center;
  gap: clamp(18px, 4vw, 72px);
}
.projects-zoom__header { position: absolute; top/left: gutter;
                         display: inline-grid; grid-template-columns: auto auto;
                         gap: 24px; }
.projects-zoom__map    { position: absolute; right/bottom: gutter;
                         display: grid; grid-auto-flow: column; gap: 6px; }
.projects-zoom__map li.is-active { opacity: 1; }
```

A full-screen two-column detail: **text panel 280–420px left, image up to 980px
right**, both vertically centred. Back control top-left. Bottom-right carries a
**dot map** — one dot per project, active one at full opacity — so you can step
through projects without returning to the marquee.

The card transition is `clip-path .52s cubic-bezier(.2,.8,.2,1)` + matching
`transform` — the card's frame expands into the overlay rather than cross-fading.

### Responsive
- `≤960px` — one column, image `54svh` on top, content below, `align-items: end`
- `≤620px` — gutters drop to 18px, header's trailing span hidden

---

## 6. What to carry over

The pattern in one sentence: **a single non-scrolling viewport, a horizontal
auto-scrolling marquee of mixed-aspect cards idling at 72% opacity, project identity
revealed only on hover at the bottom-left, and a clip-path zoom into a two-column
detail with dot pagination.**

Cheap to adapt, high payoff:
- 8-step L/P/L/P/WIDE/P/L/P size rhythm on a shared centre line
- `opacity .72 → 1` idle/hover, image `1.015 → 1.06`
- 38s linear loop, paused on hover
- discipline tags as `A / B / C`, not a tech stack dump
- dot map so the detail view is browsable

Adaptation for this build: the reference is a *designer's* portfolio, so its tags are
`DESIGN / 3D MODELING`. Ours are engineering disciplines — see `content/site.ts`.
The bleibtgleich shell is monochrome with the goo reveal; this projects row drops
into it cleanly because both are near-black-on-white with the same restraint. The
one thing to reconcile: bleibtgleich scales everything off `1vw` with `--scale-ratio`,
whereas Hiroto uses `clamp()`. Ours should use the bleibtgleich token system
throughout so the projects row shares the same grid as the rest of the site.
