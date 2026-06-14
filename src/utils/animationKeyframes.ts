import type { Direction, SwipeAction } from './useDragSetup'

/**
 * Context handed to an `animationKeyframes` callback. Everything the callback
 * needs to build a fly-out keyframe set is here — no DOM access, no component
 * internals.
 *
 * Note there is NO release-point and NO `isRestoring` here, on purpose:
 * - Starting a manual swipe from where the finger let go is the LIBRARY's job
 *   (FlashCard prepends the release frame), not the callback's.
 * - The restore animation is the swipe REVERSED, also built by the library. The
 *   callback describes ONE thing: how the card flies OUT, from center.
 */
export interface AnimationContext {
  /** The action that produced this flight: 'left' | 'right' | 'top' | 'bottom' | 'skip'. */
  type: SwipeAction
  /** Directions enabled on the card. */
  direction: Direction[]
  /** Max rotation (deg) configured on the card. */
  maxRotation: number
}

/**
 * Signature of the user-overridable animation prop. Describes how the card flies
 * OUT (from center) — either the single off-screen end frame, or a list of
 * frames for a multi-step exit. That's all the user writes:
 *
 *   (ctx) => ({ transform: `translateX(320px)`, opacity: 0 })
 *
 * The library derives the rest:
 * - swipe-out: starts the card at the drag-release point (or center) → your frames.
 * - restore:   plays your frames in REVERSE, ending at center.
 */
export type AnimationKeyframes = (ctx: AnimationContext) => Keyframe | Keyframe[]

// Distances/rotations match the CSS keyframes the WAAPI port replaces.
const OFFSET = 320
const ROTATE = 15

/** The center / resting frame — the visual the card swipes FROM and restores TO. */
export const restFrame: Keyframe = { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 1 }

/**
 * Default fly-out generator — a WAAPI port of the CSS keyframes it replaces.
 * Returns just the off-screen end frame; the library handles the start (release
 * point) and the restore (this, reversed).
 */
export const defaultAnimationKeyframes: AnimationKeyframes = ({ type }) => {
  switch (type) {
    case 'right':
      return { transform: `translate(${OFFSET}px, 0px) rotate(${ROTATE}deg) scale(1)`, opacity: 0 }
    case 'left':
      return { transform: `translate(-${OFFSET}px, 0px) rotate(-${ROTATE}deg) scale(1)`, opacity: 0 }
    case 'top':
      return { transform: `translate(0px, -${OFFSET}px) rotate(0deg) scale(0.8)`, opacity: 0 }
    case 'bottom':
      return { transform: `translate(0px, ${OFFSET}px) rotate(0deg) scale(0.8)`, opacity: 0 }
    case 'skip':
    default:
      // Skip fades in place (no translation), like the old skip-horizontal.
      return { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: 0 }
  }
}
