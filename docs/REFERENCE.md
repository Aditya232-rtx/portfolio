# bleibtgleich.dev — replication spec

Observed at **1440×900, DPR 2, desktop**. Every number below is measured from the
live DOM or read from the site's own CSS / animation bundle — not estimated from
screenshots.

Source of truth archived in `_reference/`:

| File | What |
|---|---|
| `index.html` | 69 KB — full home page markup |
| `site.css` | 122 KB — Webflow compiled stylesheet |
| `main.js` / `main.pretty.js` | 92 KB — the entire custom animation bundle |
| `local.html` | patched copy that exposes `window.__lenis` for frame stepping |

---

## 1. Stack

Webflow hosting + a single hand-written bundle served from Slater.

- **GSAP 3.15** — ScrollTrigger, SplitText, MorphSVG, CustomEase, Draggable, InertiaPlugin
- **Lenis 1.3.21** — smooth scroll
- **Barba.js** — SPA page transitions
- **Three.js r128** — the work globe
- **Raw WebGL2** — fluid sim + theme-change liquid wipe (no library)
- **Socket.IO** — live multiplayer cursors → `webflow-cursor-tracker-production.up.railway.app`

---

## 2. The scaling system

Everything is viewport-proportional. There is no breakpoint layout — the page zooms.

```css
html { font-size: 1vw }
--_special-units---global--scale-ratio: 14.4;   /* desktop → 1440px design width */
--_special-units---global--scale-ratio: 3.93;   /* ≤991px  →  393px design width */
```

Every spacing token is `calc(Nrem / var(--scale-ratio))`, so `--16px` is exactly
16 px at 1440 and scales linearly at every other width. Tokens defined:
`0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68,
72, 80, 88, 96, 104, 112, 120, 128, 144, 168, 192, 200, 240`.

### Grid — 8 columns

| | value |
|---|---|
| cell | `162px` (`--_special-units---1-cell`) |
| gap | `16px` |
| page padding | `16px` |
| **total** | 8×162 + 7×16 + 2×16 = **1440** ✓ |

Measured column origins (x): **16, 194, 372, 550, 728, 906, 1084, 1262**

A `.grid-wrap` of 8 `.grid-column` divs is toggled by the 16×16 button at (16,19) —
a dev grid overlay left in production.

---

## 3. Type

One family, one weight: **Akzidenz-Grotesk Pro Medium (500)**, single woff2.
Replacement in this build: **Inter Tight 500**.

| Style | Desktop | Mobile (≤991) |
|---|---|---|
| h1 | 90px · 88% · −0.30938rem | 45px · 90% · −0.6rem |
| h2 | 40px · 80% · −0.1rem | 40px · 80% · −0.1rem |
| p1 | 14px · 107.143% · −0.02625rem | 12px · 100% |
| l1 | 1rem · 100% · −0.016em | same |

`h3`–`h6` are defined as `0rem` — deliberately unused.

Line boxes measure **79px** for a 90px h1 (88% line-height). `.split-line-h1` adds
12px vertical padding with a matching −12px mask margin so descenders survive clipping.

---

## 4. Color

Content is pure black at 5 alphas: `100% #000`, `50% #00000080`, `30% #0000004d`,
`10% #0000001a`, `5% #0000000d`. White mirrors it.

Five themes, switched by a body class via `[data-theme-mode]`:

| mode | name | base | −075 | −150 | −200 |
|---|---|---|---|---|---|
| `base` | white | `#ffffff` | — | — | — |
| `1` | concrete | `#bec1ca` | `#b0b3bb` | `#a2a4ac` | `#989aa2` |
| `2` | rust | `#ff633d` | `#ec5c38` | `#d95434` | `#cc4f31` |
| `3` | verdigris | `#919e44` | `#86923f` | `#7b863a` | `#747e36` |
| `4` | blood | `#c31f26` | `#b41d23` | `#a61a20` | `#9c191e` |

Greys used by the nav panels: `#cbcccd` / `#d8d9da` / `#e6e6e6`.
Also defined: limestone `#cebdb2`. Selection inverts: black bg, theme-colored text.

---

## 5. Motion constants

```js
durXS 0.2   durS 0.4   durM 0.8   durL 1.2
stagger 0.1   delayReveal 0.2   staggerDefault 0.05   durationDefault 0.6
splitWorksDur 0.9   splitWorksStagger 0.04
```

```js
CustomEase "InOut" 0.76,0,0.24,1      "Out"   0.25,1,0.5,1
CustomEase "In"    0.5,0,0.75,0       "ease"  0.25,0.1,0.25,1
CustomEase "Write" 0.333,0,0.667,1    "osmo"  0.625,0.05,0,1
```

Lenis: `duration 1.2`, `smoothWheel`, `touchMultiplier 2`,
`easing: t => min(1, 1.001 - 2^(-10t))`. `history.scrollRestoration = "manual"`.
`gsap.ticker.lagSmoothing(0)`. Resize refreshes ScrollTrigger after 40ms debounce.
Honours `prefers-reduced-motion`.

---

## 6. The four reveal primitives

### 6.1 `animateTextReveal` — the signature "goo" reveal

This is the effect that defines the site. Text is split into **lines**; each line
gets its own SVG filter injected into a shared `<svg id="goo-defs">`:

```html
<feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur"/>
<feColorMatrix in="blur" mode="matrix"
  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo"/>
```

The alpha row `0 0 0 20 -8` re-sharpens the blur into a liquid threshold, so letters
appear to condense out of nothing rather than fade.

| state | tween | duration | ease | stagger |
|---|---|---|---|---|
| `initial` | `stdDeviation → 50` | — | — | — |
| `reveal` | `stdDeviation → 0` | `durL` 1.2 | `Out` | `0.1` per line |
| `hide` | `stdDeviation → 50` | `durS` 0.4 | `In` | `0.05` per line |

Element index adds a further `i * 0.1` delay. Default entry delay `0.1`.

### 6.2 `animateDivReveal`
`opacity 0 / blur(20px)` → `opacity 1 / blur(0)`, `durL` `power2.out`, stagger `0.1`.
Hide: `durS` `power2.in`, stagger `0.05`.

### 6.3 `animateClipReveal`
`inset()` clip in 4 directions. Reveal `durL` `power2.out` stagger `0.1`;
hide `durS` `power2.in` stagger `0.05`.

```
top-down    inset(0% 0% 100% 0%) → inset(0)
left-right  inset(0% 100% 0% 0%) → inset(0)
right-left  inset(0% 0% 0% 100%) → inset(0)
down-top    inset(100% 0% 0% 0%) → inset(0)
```

### 6.4 `animateLink` — char roll
Split to `lines,words,chars`; lines and words get `overflow: clip`.
Reveal `yPercent 100 → 0`, hide `yPercent 0 → -100`.
`durS` 0.4, `ease InOut`, `stagger { amount: 0.075 }` (total, not per-char).

### Scroll triggers
All reveals use `start: "top bottom"`, `once: true`, entry delay `0.1`.
Contact-page variants use `start: "top 88%"`.

---

## 7. Preloader (~12 s)

1. `lenis.stop()`. Count, role text and hero meta goo-reveal at t=0.
2. `.nav-grid` set to `x/y = -5vw`, `.nav-button` to `x = +5vw, y = -5vw`
   (±25vw on mobile).
3. Progress block tweens `height → 100%` over **4 s** `InOut`.
4. A dummy `{value:0→100}` tweens over **2 s** `InOut`, writing `${round}%` into the
   count's first split line — the giant `100%` bottom-left.
5. On complete: count goo-hides; nav grid + button tween `x/y → 0` over `durM` `Out`;
   `[data-sticky-name]` becomes visible and goo-reveals.
6. After `durS + 0.05`: `lenis.start()`, `runPageReveals()`, dispatch `lenis:settled`.

Captured frames: `100%` counter → black progress rectangle grows → hero name and
"Design Digital Products," condense in → rectangle morphs to the logo blob.

**Logo morph** (`initLogoMorph`): path is set to the rect `M0 0 L95 0 L95 160 L0 160 Z`,
the wrap clip-reveals top-down over `durM` `Out`, then `morphSVG` to the final blob
over `durL` `Out`. Icon box is **95×160** at (372,16).

---

## 8. Page structure and exact geometry

Document height **6579**; scrollable range **5679**.

| Section | y | height |
|---|---|---|
| `.intro` | 0 | 2193 |
| `.featured` | 2193 | 1768 |
| `.awards` | 3961 | 889 |
| `.footer` | 4849 | 1626 |

### 8.1 Nav (fixed)

| element | x | y | w | h | notes |
|---|---|---|---|---|---|
| `.nav-inner` | 0 | 0 | 1440 | 39 | |
| `.nav-grid` | 16 | 19 | 16 | 16 | `rgba(0,0,0,.05)`, toggles dev grid |
| `.nav-button` | 1373 | 16 | 51 | 23 | black pill, label `Menu` ⇄ `Close`, z=2 |

**Menu open** — `.nav-menu` occupies x 720–1440 (the right half), a descending staircase:

| panel | x | w | h | bg |
|---|---|---|---|---|
| Home | 720 | 240 | 360 | `#cbcccd` |
| Work | 960 | 240 | 280 | `#d8d9da` |
| Contact | 1200 | 240 | 216 | `#e6e6e6` |
| Experiments | 960 | 240 | 39 | at y=861 (viewport bottom) |

Indicators are 23×23 circles at y=16, x = panel + 16; the current page's is filled black.

Open: `clipPath → inset(0)`, `durM` `Out`, `stagger { amount: 0.1 × count, from: "end" }`.
Archive link `yPercent 100 → 0`, `durM` `Out`, offset `-=0.4`.
Close: `durS` `In`, `stagger { each: 0.1, from: "start" }`, then `display:none`.
Mobile clips left→right and staggers from `"start"`.
Also auto-closes on any scroll > 10px.

### 8.2 Intro

| element | x | y | w | h |
|---|---|---|---|---|
| `.progress-wrap` / logo | 372 | 16 | 162 / 95 | 30 / 160 |
| "Designer & Developer" `p1` | 372 | 16 | 74 | 30 |
| "Based in Kyiv" `p1` | 550 | 16 | 518 | 15 |
| "Working w/" + `TFTL` link | 550 / 623 | 31 | 69 / 30 | 15 |
| h1 "Maksym" | 550 | 444 | 313 | 79 |
| h1 "Bleibtgleich" | 550 | 523 | 430 | 79 |
| h1 "Design" | 372 | 627 | 260 | 79 |
| h1 "Digital" | 372 | 706 | 231 | 79 |
| h1 "Products," | 372 | 785 | 344 | 79 |
| h1 "UX/UI" | 550 | 888 | 244 | 79 |
| h1 "& Web-" | 550 | 967 | 265 | 79 |
| h1 "flow" | 550 | 1047 | 153 | 79 |
| h1 "dev." `left-offset-120 mb-104` | 550 | 1126 | 263 | 79 |
| `.theme-grid` | 16 | 1325 | 1408 | 162 |
| 5 × `.theme-switch` | 16, 550, 728, 1084, 1262 | 1325 | 162 | 162 |
| bio `p1` | 550 | 1503 | 340 | 45 |
| h1 "the" | 194 | 1668 | 340 | 79 |
| h1 "best" | 550 | 1668 | 696 | 79 |
| h1 "ideas deserve" | 372 | 1747 | 515 | 79 |
| h1 "execution." | 372 | 1826 | 373 | 79 |
| `© '26` `p1` | 550 | 2162 | 340 | 15 |

Note the deliberate rhythm: successive h1 lines step by exactly **79px**, and blocks
step by 79 + 24 (`mt-8` ≈ 103) between groups.

`.reveal-block-wrap` is 1440×900, `#f2f2f2`, holding the fluid `<canvas>` (z=3) and
4 orbit tiles. A hairline rule runs down the col-2/3 boundary through the whole intro.

Theme switch order left→right: `1` concrete, `3` verdigris, `2` rust, `base` white, `4` blood.

### 8.3 Featured

| element | x | y | w | h |
|---|---|---|---|---|
| `.featured-heading-wrap` | 509 | 2603 | 422 | 79 |
| h1 "Work" | 509 | 2603 | 187 | 79 |
| h1 "24-26" | 718 | 2603 | 214 | 79 |
| `.featured-globe` | 356 | 2866 | 728 | 728 |

The globe is a Three.js sphere of **16** project thumbnails, auto-rotating,
drag-spinnable with Draggable + InertiaPlugin. Heading width is measured and
matched to the globe by `initFeaturedHeadingWidth`. The `All Works` link is
`display:none` on desktop.

### 8.4 Awards

Heading is a staggered stack: `&` at col 2 (x=194), `Awards` / `Recog-` at col 3
(x=372), `nitions` at col 4 (x=550) — y = 4081, 4160, 4160, 4239.

Table rows are 23px tall, 4 cells wide, with a hairline bottom rule:

| cell | x | w |
|---|---|---|
| spacer | 190 | 166 |
| spacer | 368 | 344 |
| award org | 724 | 344 |
| award title | 1080 | 166 |

Year and project labels sit at x=194 and x=372 on the group's first row.
Hover fills all cells of a row with `--fill--tertiary` (`#0000001a`), `transition: background 0s`
in, `0.4s Out` back. Rows with a certificate reveal an image on hover.

### 8.5 Footer

| element | x | y | w | h |
|---|---|---|---|---|
| h1 "Everything" | 372 | 4986 | 387 | 79 |
| h1 "that exists" | 372 | 5065 | 375 | 79 |
| h1 "had first" | 550 | 5168 | 297 | 79 |
| h1 "existed as" | 550 | 5248 | 373 | 79 |
| `.footer-time` | 16 | 5447 | 1408 | 264 |
| h1 `(` | 153 | 5539 | 25 | 79 |
| h1 hours | 194 | 5539 | 92 | 79 |
| h1 `:` | 444 | 5539 | 18 | 79 |
| `.footer-logo-cell` | 624 | 5447 | 192 | 264 |
| h1 `:` | 978 | 5539 | 18 | 79 |
| h1 minutes | 1154 | 5539 | 92 | 79 |
| h1 `)` | 1262 | 5539 | 25 | 79 |
| h1 "nothing" | 612 | 5831 | 278 | 79 |
| h1 "more" | 696 | 5910 | 194 | 79 |
| h1 "than a" | 840 | 6013 | 228 | 79 |
| h1 "sentence." | 715 | 6092 | 353 | 79 |
| `.foooter-mail` | 372 | 6005 | 340 | 166 |
| `.link-button` (email) | 366 | 6149 | 173 | 23 |
| 3 × `.social-item` | 616, 688, 760 | 6292 | 64 | 64 |

The clock reads `( HH : [logo marquee] : MM )` — a live local time with a 192×264
black cell cycling client logos between the colons. Socials are 64px circles with
15px icons; hover scales to `0.9` (0.3s ease) and inverts to the background color.
The email button inverts to a solid black fill on hover.

### 8.6 Sticky name (fixed, bottom)

| element | x | y | w | h |
|---|---|---|---|---|
| `.sticky-name` | 0 | 0 | 1440 | 104 |
| `bleibt` | 16 | 9 | 202 | 79 |
| `gleich` | 1205 | 9 | 219 | 79 |
| `.sticky-name-meta` | 16 | 73 | 1408 | 15 |

Normally the two halves sit pinned to opposite edges. **At the very bottom of the
page** `.sticky-name-inner` tweens `width: 100% → 29.45rem` (424px) over `durM` `InOut`
while `opacity 0.1 → 1` over `durS` — the name snaps together — then the meta lines
goo-reveal. Reverses when you scroll back up.

---

## 9. Interaction catalogue

| Trigger | Behaviour |
|---|---|
| Any `.link-inner` hover (desktop ≥992) | label chars roll up and out, shadow chars roll up and in — `durS`, `InOut`, `stagger amount 0.075`. Paused reversible timeline. |
| `[data-underline]` hover | `background-size: 100% 0.35rem → 0% 0.3rem`, `0.6s var(--ease-in-out)` — the underline wipes away |
| `.nav-button` click | staircase menu open/close, label `Menu` ⇄ `Close` |
| `.nav-grid` click | toggles the 8-column dev grid overlay |
| `.theme-switch` click | WebGL liquid circular wipe from the click point, `uProgress → maxCornerDistance + 0.75`, **1.5 s** `Out`; swaps body class, favicon and `sessionStorage`; switch `borderWidth` tweens `durS` |
| `[data-tilt]` hover | perspective 1000, `rotationY ±40°`, `rotationX ±25°`, `quickTo` 0.6s `power3.out`, returns to 0 on leave |
| `.d-award-item` hover | all cells fill `#0000001a` instantly, release over 0.4s `Out`; certificate image reveals |
| `.social-item` hover | `scale 0.9` 0.3s, icon inverts to bg color |
| `.link-button` hover | inverts to solid black fill |
| `[data-haptic]` click | fires `window._haptics.trigger('medium')` |
| Cursor | custom blob follower; grows over interactive targets; **type to broadcast a chat bubble** to other live visitors over Socket.IO |
| Scrollbar | 8px track at x=1432, 4×16 thumb; auto-hides after **1000 ms** idle (`autoAlpha`, 0.3s); draggable; magnetic with `data-magnetic-strength="20"` |

---

## 10. Pages

`/` · `/work` · `/contact` · `/archive` (linked as "Experiments").
Barba namespaces: `home`, `works`, `contact`, `archive`.

Barba transition `fade`, `sync: true`, `timeout: 7000`, `preventRunning: true`.
On leave: `closeMenu()`, sticky name reverses, next container is pinned
`position:fixed`, `lenis.stop()`, `body.is-transitioning` (forces `cursor: wait`).
On enter: Webflow re-init, cursor page sync, goo filters cleaned up.

**Theme persists across navigation** via `sessionStorage` — observed carrying the
blood theme from `/contact` straight into the `/archive` preloader. The favicon is
swapped to match on every change.

Every non-home page opens with a `.preloader-wrap` section — a shortened version of
the home preloader (progress bar + hero meta, no 4-second count) which then
goo-hides and fades out over `durS`.

### 10.1 The menu — observed frame by frame

Clicking `.nav-button`:

1. The pill label swaps to **"Close" immediately**, on the same frame as the click —
   it does not wait for the panels. The char-roll runs on the label itself.
2. The three panels clip-reveal **top-down**, `durM` `Out`,
   `stagger { amount: 0.1 × 3, from: "end" }` — Contact (rightmost) starts first.
3. `Experiments` slides up `yPercent 100 → 0`, `durM` `Out`, overlapping `-=0.4`.

The panels are a **descending staircase**, each step shorter and one shade lighter:

| panel | x | w | h | bg |
|---|---|---|---|---|
| Home | 720 | 240 | 360 | `#cbcccd` |
| Work | 960 | 240 | 280 | `#d8d9da` |
| Contact | 1200 | 240 | 216 | `#e6e6e6` |
| Experiments | 960 | 240 | 39 | `#d8d9da`, pinned to viewport bottom (y=861) |

Panel width 240 = 1440/6 exactly. The label sits at the **bottom-left** of each
panel, so the staircase reads as a descending diagonal of type. Numbered indicators
(23×23 circles at y=16, x = panel+16) mark 1/2/3; the current page's is filled black.

Closing reverses at `durS` `In`, `stagger { each: 0.1, from: "start" }`, then
`display:none`. Any scroll > 10px also closes it.

### 10.2 `/work`

Enters with the **hole transition**: a rectangle grows from the centre outward until
it frames a 4-cell × 60vh window, driven by `--hole-progress` 0→1 through an
`evenodd` `clip-path: polygon(...)` on `.works-overlay`.

Landed layout: `24` · `Work` · `26` on one line, `24` and `26` sitting outside the
grey panel at either edge. Beneath the title, filter tabs `Cards / Sphere`
(`[data-filter-tab]`, separator `/` in `is-secondary`).

- **Cards** — a 2-column grid of `.works-item`. Each is a black panel holding a
  centred mockup, with a `Case` / `Shot` pill plus the project name bottom-left, and
  a hover button. The image wrap carries `[data-tilt=card]`, so every card tilts
  under the pointer (±40° Y, ±25° X).
- **Sphere** — swaps to the same Three.js globe used on the home page.

Projects listed: Velor Dating App, bleibtgleich'25, JDS, Nabil Issa, Grabl App,
Mkaan, Durak Miniapp, Metrics over aesthetics, Do Lorem Ipsum, Cybernation Merch,
Grabl App Logo, XPM Logo.

### 10.3 `/contact` — the rotary dial

The whole page is one object: a **rotary telephone dial**, measured at **462×462**
at (489,167) — dead centre horizontally, above centre vertically.

```
--dial-size: 32.083rem  → 462px      --item-size: 5rem     → 72px
--gap:       1.111rem   →  16px      --radius: size/2 − item/2 − gap → 179px
```

Nine items at 30° steps, placed by
`rotate(θ) translateY(-radius) rotate(-θ)` with θ running
`30° → 0° → 330° → 300° → 270° → 240° → 210° → 180° → 150°`
(1 o'clock round to 5 o'clock):

| # | item |
|---|---|
| 1–4, 6 | the five theme switches (coloured ring, active one filled black) |
| 5 | `@` — email, opens Gmail compose |
| 7 | Instagram |
| 8 | Behance |
| 9 | LinkedIn |

Around it: a thin outer ring (`.dial-outer`, `--stroke` border, 50% radius), nine
`.dial-hole` cut-outs, a black **finger stop** wedge at ~4 o'clock outside the ring,
and a full-width horizontal hairline (`.contact-divider`) crossing the dial centre.

The centre is a large black disc showing `[data-contact-dial=logo]`. **On hover of
any item the logo is replaced by that item's label** in white `p1` — observed
`"send email"` and `"change theme"`. Item hover inverts to black fill with a white
glyph (`transition: color 0s` in, 0.4s back).

Below the dial, the sticky name is shown **joined** as one huge `bleibtgleich`.

### 10.4 `/archive` — "Experiments"

Not a 2D pan — a full **Three.js chunked infinite 3D volume**. 34 media items
scatter through space; near ones render large and opaque, far ones small and faded.

- Camera position `(x,y,z)` with target-velocity, lerp damping `0.16`, decay `0.9`,
  clamped to `±3.2`
- Chunk size **110** units; chunks regenerate on a `cx,cy,cz` key change, throttled
  100 / 400 / 500 ms depending on speed
- LOD: full opacity within 2 chunks, fading out over the next 1
- Fog/culling ramp between distance **140** and **260**
- Mouse **drift** parallax, strength `1.5` scaled by depth, lerp `0.12` (`0.2` while moving)
- Drag to pan; scroll accumulates Z with `0.8` decay; **WASD / arrows / Q / E** also fly
- **Bend** — a spatial curvature `0.00225 × d²` that eases in at `0.06` and out at
  `0.035` when Z-velocity exceeds `0.12`, active for 220 ms after scroll input
- Per-item **breathing** — `sin(t × 0.00045 × rate + phase) × 1.4`
- Click to **focus** an item; intro reveal staged over 900 ms with 1100 ms offset
- Cursor swaps `grab` / `grabbing` / `pointer`
- The `Experiments` heading goo-**hides** while the camera moves and goo-**reveals**
  once still for 3 s

On this page the sticky name is pinned `position: fixed` to the viewport bottom
rather than following the document.

---

## 11. Full behaviour inventory (`main.js`)

```
initPreloader          initLogoMorph            initFluidReveal
initOrbitTiles         initGlobe / animateGlobe initElementsReveal
animateTextReveal      animateClipReveal        animateDivReveal
animateLink            animateCardsSplit        initStickyNameReveal
initThemeMode          initTotemActivation      initCustomScrollbar
initTiltCursor         initCursorTracker        initMsgChannel
initHaptics            initLenis                initAwards
initFooterTime         initFooterLogo           initContactDial
initDialOverlay        initInfiniteCanvas       initCutList
initFilterTabs         initWorksIntroMask       initWorksItemHover
initNavDropdown        initDevGrid              initLinks
initNextEntity         initFeaturedHeadingWidth initFeaturedHeadingHeightMobile
runPageOnceAnimation   runPageLeaveAnimation    prepareForTransition
settleAfterTransition  resetPage                killTextTweens
cleanupGooFilters      getTextFeBlurs           updateNavIndicators
```

---

## 12. Decisions for this build

### Dropped
**Live multiplayer cursors.** `initCursorTracker` + `initMsgChannel` + Socket.IO are
out of scope. The custom cursor itself stays (follower, tilt, hover growth) — only
the networked remote-cursor and chat-bubble layer is removed.

### Logo — replaced
The original's morphing "face" blob is replaced everywhere by the **⌘ command mark**
(`public/logo-command.svg`, a freehand Streamline glyph, `viewBox 0 0 24 24`,
single path, `fill-rule="evenodd"`).

It appears in four places:

| Where | Original | Notes |
|---|---|---|
| Home preloader | 95×160 blob | morph target |
| Contact dial centre | white blob on black | |
| Favicon | per-theme SVG | 5 variants |
| Theme totem overlay | blob | |

Two things this changes:

1. **Aspect ratio.** The original icon box is 95×160 (0.59); the command mark is
   square. The box becomes **120×120**, keeping the same 16px top offset at column 3
   so the rest of the grid is untouched.
2. **The morph.** `initLogoMorph` currently morphs the rect
   `M0 0 L95 0 L95 160 L0 160 Z` into a single closed blob. The command mark is one
   path containing **five disjoint subpaths** (four corner loops + the centre), which
   MorphSVG cannot resolve cleanly from a single rectangle — it produces tearing
   unless `shapeIndex` is hand-tuned per subpath.

   Plan: keep the `durM` `Out` top-down clip reveal exactly as-is, then instead of a
   morph, run a `durL` `Out` **scale + goo-blur settle** on the mark (`stdDeviation`
   50 → 0, reusing the site's own goo filter). Same rhythm and duration as the
   original, same "condenses into being" feel, no tearing. Flagging it because it is
   the one place the motion is not a literal 1:1 copy.

### Kept as-is
- The font is licensed; Inter Tight 500 substitutes with tracking tuned to match.
- The goo filter is the single highest-value effect to get right — it carries the
  whole identity. Everything else is layout discipline.
- Observation caveat: this harness blocks synthetic wheel events and does not
  repaint the pane on JS-driven scroll, so section composition was captured by
  collapsing preceding sections at scroll 0 and by direct DOM measurement rather
  than by scrolling. All coordinates above come from `getBoundingClientRect` at a
  true 1440×900 viewport.
