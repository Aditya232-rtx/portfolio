/**
 * The "goo" text reveal — the signature effect of the reference site.
 *
 * Each line of split text gets its own SVG filter: a heavy Gaussian blur fed
 * through a colour matrix whose alpha row (`0 0 0 20 -8`) re-sharpens the blur
 * into a liquid threshold. Animating stdDeviation 50 → 0 makes letters condense
 * out of nothing rather than simply fade in.
 *
 * See docs/REFERENCE.md §6.1.
 */

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { DUR, STAGGER, DELAY_REVEAL } from './constants'

const GOO_DEFS_ID = 'goo-defs'
const BLUR_HIDDEN = 50
const BLUR_BASE = 30
const BLUR_VISIBLE = 0

export type GooMode = 'initial' | 'reveal' | 'hide'

type SplitTarget = HTMLElement & { _split?: SplitText }

/** Shared <svg> that holds every generated filter. Created once, lazily. */
function gooDefs(): SVGSVGElement {
  const existing = document.querySelector<SVGSVGElement>(`svg#${GOO_DEFS_ID}`)
  if (existing) return existing

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('id', GOO_DEFS_ID)
  svg.setAttribute('aria-hidden', 'true')
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;'
  document.body.prepend(svg)
  return svg
}

/** Give one split line its own filter, once. */
function attachFilter(line: HTMLElement): void {
  if (line.dataset.filterId) return

  const id = `goo-${Math.random().toString(36).slice(2, 11)}`
  line.dataset.filterId = id

  const filter = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'filter',
  )
  filter.setAttribute('id', id)
  filter.innerHTML = `
    <feGaussianBlur in="SourceGraphic" stdDeviation="${BLUR_BASE}" result="blur"></feGaussianBlur>
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo"></feColorMatrix>
  `
  gooDefs().appendChild(filter)
  line.style.filter = `url(#${id})`
}

function blurNode(line: HTMLElement): SVGFEGaussianBlurElement | null {
  const id = line.dataset.filterId
  if (!id) return null
  return document.querySelector<SVGFEGaussianBlurElement>(
    `#${id} feGaussianBlur`,
  )
}

/** Split an element into lines and wire up its filters. Idempotent. */
function ensureSplit(el: SplitTarget): SplitText {
  if (!el._split) {
    el._split = new SplitText(el, { type: 'lines' })
  }
  el._split.lines.forEach((line) => attachFilter(line as HTMLElement))
  return el._split
}

/**
 * Animate one or more elements.
 *
 * @param delay overrides the default entry delay; element index adds a further
 *              `index * STAGGER` on top, matching the reference.
 */
export function gooText(
  targets: gsap.DOMTarget,
  mode: GooMode,
  delay?: number,
): void {
  const elements = gsap.utils.toArray<SplitTarget>(targets)
  if (!elements.length) return

  elements.forEach((el, index) => {
    const split = ensureSplit(el)
    const elementDelay = index * STAGGER

    if (mode === 'initial') {
      split.lines.forEach((line) => {
        blurNode(line as HTMLElement)?.setAttribute(
          'stdDeviation',
          String(BLUR_HIDDEN),
        )
      })
      return
    }

    if (mode === 'reveal') {
      gsap.set(el, { autoAlpha: 1 })
      const tl = gsap.timeline()
      split.lines.forEach((line, i) => {
        const blur = blurNode(line as HTMLElement)
        if (!blur) return
        tl.to(
          blur,
          {
            attr: { stdDeviation: BLUR_VISIBLE },
            duration: DUR.l,
            delay: i === 0 ? (delay ?? DELAY_REVEAL) + elementDelay : 0,
            ease: 'Out',
          },
          i * STAGGER,
        )
      })
      return
    }

    // hide
    const tl = gsap.timeline({
      onComplete: () => gsap.set(el, { autoAlpha: 0 }),
    })
    split.lines.forEach((line, i) => {
      const blur = blurNode(line as HTMLElement)
      if (!blur) return
      tl.to(
        blur,
        {
          attr: { stdDeviation: BLUR_HIDDEN },
          duration: DUR.s,
          delay: i === 0 ? (delay ?? 0) : 0,
          ease: 'In',
        },
        i * STAGGER * 0.5,
      )
    })
  })
}

/** Kill in-flight tweens on an element's filters, without reverting the split. */
export function killGooTweens(targets: gsap.DOMTarget): void {
  gsap.utils.toArray<SplitTarget>(targets).forEach((el) => {
    el._split?.lines.forEach((line) => {
      const blur = blurNode(line as HTMLElement)
      if (blur) gsap.killTweensOf(blur)
    })
  })
}

/** Remove every generated filter. Call between page transitions. */
export function cleanupGooFilters(): void {
  document.querySelector(`svg#${GOO_DEFS_ID}`)?.remove()
  document.querySelectorAll<HTMLElement>('[data-filter-id]').forEach((el) => {
    delete el.dataset.filterId
    el.style.filter = ''
  })
}
