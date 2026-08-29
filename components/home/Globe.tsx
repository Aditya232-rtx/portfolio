'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PROJECTS } from '@/content/site'

/**
 * The work globe: project thumbnails scattered over a sphere that turns on its
 * own, can be spun by dragging, and enlarges a tile in place on click.
 *
 * Matched to the reference recording (public/globe.mov):
 *
 * - Tiles face *outward* from the centre rather than being billboarded. That is
 *   what produces the skewed trapezoids and the thin edge-on slivers; a
 *   billboarded tile would always be a flat rectangle facing you.
 * - Both hemispheres render, but tiles fade toward the background as they pass
 *   behind the sphere. The far ones sit at a few percent opacity, which is why
 *   their mirrored back-faces never read as a mistake.
 * - Every tile's shape and poster come straight from PROJECTS — only
 *   SpillTheReel (the one project with shape: 'portrait') gets a portrait
 *   plane; everything else renders landscape, matching the real project data
 *   rather than a random per-tile assignment.
 * - Clicking a tile pulls it in front of the sphere and enlarges it in place,
 *   at roughly the size the reference recording shows — not a full-page
 *   navigation. Clicking it again, or clicking empty space, sends it back.
 */

const TILE_COUNT = 22
const SPHERE_RADIUS = 3.2
/** Long edge of a landscape tile, before the per-tile size jitter. */
const TILE_BASE = 1.0
const CAMERA_Z = 8.6

/** Radians per second of idle rotation. */
const IDLE_SPIN = 0.1
/** How much a pixel of drag turns the sphere. */
const DRAG_SENSITIVITY = 0.005
/** Per-frame decay applied to drag momentum. */
const SPIN_DAMPING = 0.94
/** A pointerdown→up within this many px is a click, not a drag. */
const CLICK_MOVE_THRESHOLD = 6

/** Opacity at the very back and the very front of the sphere. */
const OPACITY_BACK = 0.05
const OPACITY_FRONT = 1
/**
 * Depth window over which a tile fades, as a 0..1 position from back to front.
 * Everything past FADE_END sits at full opacity, so the front hemisphere reads
 * solid and only tiles genuinely swinging behind ghost out.
 */
const FADE_START = 0.12
const FADE_END = 0.62

/** Vertical drag is bounded so the sphere never tips past its poles. */
const MAX_TILT = 0.6
const clampTilt = (value: number): number =>
  Math.max(-MAX_TILT, Math.min(MAX_TILT, value))

/** How much bigger a focused tile gets, and how far it sits in front of the sphere. */
const FOCUS_SCALE = 2.3
const FOCUS_DISTANCE_FRACTION = 0.45
const FOCUS_LERP = 0.18

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Deterministic 0..1 from an index — same scatter on every render. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

type Tile = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> & {
  /** The tile's position and orientation on the sphere, before any focus offset. */
  homePosition: THREE.Vector3
  homeQuaternion: THREE.Quaternion
  baseScale: number
  /**
   * Set only while flying back from a focused state. World-space, computed
   * once when the return starts (see setFocused) — each returning tile needs
   * its own, since more than one can be mid-flight if the user focuses a
   * second tile before the first has finished returning.
   */
  returnTarget?: THREE.Vector3
  returnQuaternion?: THREE.Quaternion
}

export function Globe({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = CAMERA_Z

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const loader = new THREE.TextureLoader()
    const disposables: Array<{ dispose: () => void }> = []
    const tiles: Tile[] = []

    for (let i = 0; i < TILE_COUNT; i += 1) {
      // Fibonacci sphere: even coverage without the pole crowding a naive
      // lat/long grid produces.
      const y = 1 - (i / (TILE_COUNT - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = GOLDEN_ANGLE * i

      const position = new THREE.Vector3(
        Math.cos(theta) * radiusAtY,
        y,
        Math.sin(theta) * radiusAtY,
      ).multiplyScalar(SPHERE_RADIUS)

      // Real project data, not a random per-tile assignment: only the one
      // project actually shaped portrait renders as a portrait plane.
      const project = PROJECTS[i % PROJECTS.length]
      const isPortrait = project.shape === 'portrait'

      const texture = loader.load(project.poster)
      texture.colorSpace = THREE.SRGBColorSpace
      disposables.push(texture)

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        // Back faces must draw — the fading far hemisphere is part of the look.
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      disposables.push(material)

      // Modest size jitter only — enough to avoid a lattice without tiles
      // crowding or overlapping their neighbours.
      const scale = 0.85 + hash(i) * 0.35
      const long = TILE_BASE * scale
      const short = long * 0.63
      const geometry = new THREE.PlaneGeometry(
        isPortrait ? short : long,
        isPortrait ? long : short,
      )
      disposables.push(geometry)

      const mesh = new THREE.Mesh(geometry, material) as Tile
      mesh.position.copy(position)
      // Face outward from the sphere's centre.
      mesh.lookAt(position.clone().multiplyScalar(2))
      // A little roll so the field does not read as a regular lattice.
      mesh.rotateZ((hash(i + 200) - 0.5) * 0.5)

      mesh.homePosition = position.clone()
      mesh.homeQuaternion = mesh.quaternion.clone()
      mesh.baseScale = scale

      group.add(mesh)
      tiles.push(mesh)
    }

    // ---- sizing ------------------------------------------------------------
    const resize = () => {
      /**
       * clientWidth/clientHeight, not getBoundingClientRect: this mount is the
       * exact node Featured.tsx applies `transform: scale(...)` to while the
       * section scrolls into place. getBoundingClientRect reports the
       * *visual* (post-transform) box, so reading it here would bake whatever
       * mid-animation scale happened to be active into the renderer's actual
       * resolution — leaving the globe permanently blurry once GSAP finishes
       * animating it up to scale(1). clientWidth is the element's layout box
       * and is never affected by its own CSS transform.
       */
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    // ---- focus (click to enlarge in place) ----------------------------------
    const raycaster = new THREE.Raycaster()
    const pointerNdc = new THREE.Vector2()
    let focused: Tile | null = null
    // Tiles mid-flight back to their sphere position — a Set, not a single
    // slot, so focusing a second tile before the first finishes returning
    // doesn't strand it.
    const returning = new Set<Tile>()
    /** World-space distance under which a returning tile snaps home exactly. */
    const RETURN_SNAP_DISTANCE = 0.02

    const focusTarget = new THREE.Vector3()
    const focusQuaternion = new THREE.Quaternion()
    const planeNormal = new THREE.Vector3(0, 0, 1)
    const toCamera = new THREE.Vector3()

    const setFocused = (tile: Tile | null) => {
      if (focused === tile) return

      if (focused) {
        /**
         * Not an immediate group.attach(): that preserves world transform,
         * meaning the tile would keep the "pulled out, enlarged" size and
         * position permanently, just now also spinning with the sphere —
         * never settling back onto its actual point on the surface. Instead
         * it stays a free-floating child of `scene` and lerps toward its
         * home spot (computed once, in the sphere's current orientation) for
         * a few frames, then snaps into `group` for real.
         */
        const returned = focused
        returned.returnTarget = (returned.returnTarget ?? new THREE.Vector3())
          .copy(returned.homePosition)
          .applyMatrix4(group.matrixWorld)
        returned.returnQuaternion = (
          returned.returnQuaternion ?? new THREE.Quaternion()
        )
          .copy(group.quaternion)
          .multiply(returned.homeQuaternion)
        returning.add(returned)
      }

      focused = tile
      if (focused) {
        returning.delete(focused) // a newly focused tile is no longer mid-return
        scene.attach(focused) // pulled out so group rotation stops moving it
      }
    }

    const pickTile = (clientX: number, clientY: number): Tile | null => {
      const rect = mount.getBoundingClientRect()
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointerNdc, camera)
      const hit = raycaster.intersectObjects(tiles, false)[0]
      return (hit?.object as Tile) ?? null
    }

    // ---- drag (and click, on release) ---------------------------------------
    let velocityX = 0
    let velocityY = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let downX = 0
    let downY = 0

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      downX = event.clientX
      downY = event.clientY
      mount.setPointerCapture(event.pointerId)
      mount.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      velocityY = (event.clientX - lastX) * DRAG_SENSITIVITY
      velocityX = (event.clientY - lastY) * DRAG_SENSITIVITY
      group.rotation.y += velocityY
      group.rotation.x = clampTilt(group.rotation.x + velocityX)
      lastX = event.clientX
      lastY = event.clientY
    }

    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      mount.releasePointerCapture(event.pointerId)
      mount.style.cursor = 'grab'

      const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
      if (moved > CLICK_MOVE_THRESHOLD) return // a drag, not a click

      const hit = pickTile(event.clientX, event.clientY)
      setFocused(hit && hit === focused ? null : hit)
    }

    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('pointercancel', onPointerUp)
    mount.style.cursor = 'grab'

    // ---- loop ----------------------------------------------------------------
    let frame = 0
    let previous = performance.now()
    const world = new THREE.Vector3()
    const focusScale = new THREE.Vector3()
    const unitScale = new THREE.Vector3(1, 1, 1)

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const delta = Math.min((now - previous) / 1000, 0.1)
      previous = now

      if (!dragging) {
        // Momentum carries the spin on release, then settles back to idle.
        velocityY *= SPIN_DAMPING
        velocityX *= SPIN_DAMPING
        group.rotation.y += velocityY + (reduced ? 0 : IDLE_SPIN * delta)
        group.rotation.x = clampTilt(group.rotation.x + velocityX)
      }

      group.updateMatrixWorld()

      /**
       * Depth fade. A tile at the back of the sphere is almost invisible and
       * comes up to full strength as it swings to the front — the same
       * ghosting the reference uses to hide far-side back-faces. The focused
       * tile is excluded: it should read as fully opaque regardless of where
       * its old sphere position would have placed it.
       */
      tiles.forEach((tile) => {
        if (tile === focused || returning.has(tile)) return
        world.setFromMatrixPosition(tile.matrixWorld)
        // 0 at the very back of the sphere, 1 at the very front.
        const depth = (world.z / SPHERE_RADIUS + 1) / 2
        // Smoothstep over the rear band only, so the whole front hemisphere
        // stays at full strength instead of everything looking washed out.
        const t = Math.min(
          1,
          Math.max(0, (depth - FADE_START) / (FADE_END - FADE_START)),
        )
        const eased = t * t * (3 - 2 * t)
        tile.material.opacity =
          OPACITY_BACK + (OPACITY_FRONT - OPACITY_BACK) * eased
      })

      if (focused) {
        // A point between the sphere's centre and the camera — pulls the
        // tile out in front of everything else without shoving it into the
        // lens.
        focusTarget
          .copy(camera.position)
          .multiplyScalar(FOCUS_DISTANCE_FRACTION)
        toCamera.copy(camera.position).sub(focused.position).normalize()
        focusQuaternion.setFromUnitVectors(planeNormal, toCamera)

        focused.material.opacity = 1
        focused.position.lerp(focusTarget, FOCUS_LERP)
        focused.quaternion.slerp(focusQuaternion, FOCUS_LERP)
        const targetScale = focused.baseScale * FOCUS_SCALE
        focusScale.set(targetScale, targetScale, 1)
        focused.scale.lerp(focusScale, FOCUS_LERP)
      }

      /**
       * Tiles flying back to the sphere: lerp toward the world-space target
       * frozen at the moment they were unfocused, then snap into `group` —
       * as an exact local-space child again, base size, base orientation —
       * once close enough that the switch is invisible.
       */
      returning.forEach((tile) => {
        const target = tile.returnTarget
        const targetQuat = tile.returnQuaternion
        if (!target || !targetQuat) {
          returning.delete(tile)
          return
        }

        tile.material.opacity = 1
        tile.position.lerp(target, FOCUS_LERP)
        tile.quaternion.slerp(targetQuat, FOCUS_LERP)
        tile.scale.lerp(unitScale, FOCUS_LERP)

        if (tile.position.distanceTo(target) < RETURN_SNAP_DISTANCE) {
          returning.delete(tile)
          group.add(tile) // plain add: about to set exact local values anyway
          tile.position.copy(tile.homePosition)
          tile.quaternion.copy(tile.homeQuaternion)
          tile.scale.set(1, 1, 1)
        }
      })

      renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('pointercancel', onPointerUp)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}
