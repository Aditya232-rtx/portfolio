/**
 * The remaining three reveal primitives + their ScrollTrigger wiring.
 * See docs/REFERENCE.md §6.2–§6.4.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DUR, STAGGER, DELAY_REVEAL } from './constants'
import { gooText, type GooMode } from './goo'

const BLUR_PX = 20

/** opacity + blur fade. */
export function divReveal(
  targets: gsap.DOMTarget,
  mode: GooMode,
  delay?: number,
): void {
  const els = gsap.utils.toArray<HTMLElement>(targets)
  if (!els.length) return

  if (mode === 'initial') {
    gsap.set(els, { opacity: 0, filter: `blur(${BLUR_PX}px)` })
    return
  }
  if (mode === 'reveal') {
    gsap.to(els, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: DUR.l,
      delay: delay ?? DELAY_REVEAL,
      stagger: STAGGER,
      ease: 'power2.out',
      overwrite: true,
    })
    return
  }
  gsap.to(els, {
    opacity: 0,
    filter: `blur(${BLUR_PX}px)`,
    duration: DUR.s,
    delay: delay ?? 0,
    stagger: STAGGER * 0.5,
    ease: 'power2.in',
    overwrite: true,
  })
}

const CLIP = {
  'top-down': { hidden: 'inset(0% 0% 100% 0%)', visible: 'inset(0% 0% 0% 0%)' },
  'left-right': { hidden: 'inset(0% 100% 0% 0%)', visible: 'inset(0% 0% 0% 0%)' },
  'right-left': { hidden: 'inset(0% 0% 0% 100%)', visible: 'inset(0% 0% 0% 0%)' },
  'down-top': { hidden: 'inset(100% 0% 0% 0%)', visible: 'inset(0% 0% 0% 0%)' },
} as const

export type ClipDirection = keyof typeof CLIP

/** inset() clip wipe in one of four directions. */
export function clipReveal(
  targets: gsap.DOMTarget,
  direction: ClipDirection,
  mode: GooMode,
  delay?: number,
): void {
  const els = gsap.utils.toArray<HTMLElement>(targets)
  const state = CLIP[direction]
  if (!els.length || !state) return

  if (mode === 'initial') {
    gsap.set(els, { clipPath: state.hidden })
    return
  }
  if (mode === 'reveal') {
    gsap.to(els, {
      clipPath: state.visible,
      duration: DUR.l,
      delay: delay ?? DELAY_REVEAL,
      stagger: STAGGER,
      ease: 'power2.out',
      overwrite: true,
    })
    return
  }
  gsap.to(els, {
    clipPath: state.hidden,
    duration: DUR.s,
    delay: delay ?? 0,
    stagger: STAGGER * 0.5,
    ease: 'power2.in',
    overwrite: true,
  })
}

const LINK_STAGGER_AMOUNT = 0.075

type LinkTarget = HTMLElement & { _split?: SplitText }

/**
 * Character roll used by every hover link: the visible label rolls up and out
 * while its duplicate "shadow" rolls up and in.
 */
export function linkRoll(
  targets: gsap.DOMTarget,
  mode: GooMode,
  delay?: number,
  timeline?: gsap.core.Timeline,
  position?: gsap.Position,
): void {
  const els = gsap.utils.toArray<LinkTarget>(targets)
  if (!els.length) return

  els.forEach((el, index) => {
    el._split?.revert()
    el._split = new SplitText(el, {
      type: 'lines,words,chars',
      tag: 'span',
      linesClass: 'split-line',
      wordsClass: 'split-word',
      charsClass: 'split-char',
    })

    const chars = el._split.chars
    if (!chars?.length) return

    // Clip at line and word level so characters disappear cleanly.
    el._split.lines.forEach((l) => {
      const line = l as HTMLElement
      line.style.display = 'block'
      line.style.overflow = 'clip'
    })
    el._split.words.forEach((w) => {
      ;(w as HTMLElement).style.overflow = 'clip'
    })

    const ctx = timeline ?? gsap
    const at = position ?? '>'
    const elementDelay = index * STAGGER

    gsap.killTweensOf(chars)

    if (mode === 'initial') {
      gsap.set(chars, { yPercent: 100 })
      return
    }

    if (mode === 'reveal') {
      ctx.fromTo(
        chars,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: DUR.s,
          delay: timeline ? 0 : (delay ?? DELAY_REVEAL) + elementDelay,
          stagger: { amount: LINK_STAGGER_AMOUNT },
          ease: 'InOut',
          overwrite: true,
        },
        timeline ? at : undefined,
      )
      return
    }

    ctx.to(
      chars,
      {
        yPercent: -100,
        duration: DUR.s,
        delay: timeline ? 0 : (delay ?? 0),
        stagger: { amount: LINK_STAGGER_AMOUNT },
        ease: 'InOut',
        overwrite: true,
      },
      timeline ? at : undefined,
    )
  })
}

/**
 * Wire every `[data-reveal]` element in `root` to a one-shot ScrollTrigger.
 * Returns a cleanup function.
 */
export function initElementsReveal(root: ParentNode = document): () => void {
  const triggers: ScrollTrigger[] = []
  const ENTRY_DELAY = 0.1

  const onEnter = (
    el: HTMLElement,
    run: () => void,
    trigger: Element = el,
  ) => {
    /**
     * ScrollTrigger records the initial state on creation without firing
     * onEnter, so anything already on screen would never reveal. Run those
     * immediately and only wire a trigger for what is still below the fold.
     */
    if (trigger.getBoundingClientRect().top < window.innerHeight) {
      run()
      return
    }

    triggers.push(
      ScrollTrigger.create({
        trigger,
        start: 'top bottom',
        once: true,
        onEnter: run,
      }),
    )
  }

  root.querySelectorAll<HTMLElement>('[data-reveal="text"]').forEach((el) => {
    gsap.set(el, { visibility: 'visible' })
    gooText(el, 'initial')
    onEnter(el, () => gooText(el, 'reveal', ENTRY_DELAY))
  })

  const clipMap: Record<string, ClipDirection> = {
    'clip-down': 'top-down',
    'clip-left': 'left-right',
    'clip-right': 'right-left',
    'clip-top': 'down-top',
  }

  Object.entries(clipMap).forEach(([attr, direction]) => {
    root
      .querySelectorAll<HTMLElement>(`[data-reveal="${attr}"]`)
      .forEach((el) => {
        gsap.set(el, { visibility: 'visible' })
        clipReveal(el, direction, 'initial')
        onEnter(el, () => clipReveal(el, direction, 'reveal', ENTRY_DELAY))
      })
  })

  root.querySelectorAll<HTMLElement>('[data-reveal="div"]').forEach((el) => {
    gsap.set(el, { visibility: 'visible' })
    divReveal(el, 'initial')
    const group = el.closest<HTMLElement>('[data-reveal="w"]')
    onEnter(el, () => divReveal(el, 'reveal', ENTRY_DELAY), group ?? el)
  })

  /**
   * Triggers are created after the preloader hands off, by which point the
   * page height has changed. Without a refresh their start positions are stale
   * and anything already in view never fires.
   */
  ScrollTrigger.refresh()

  return () => triggers.forEach((t) => t.kill())
}
