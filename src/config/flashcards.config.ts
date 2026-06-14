import type { FlashCardsProps } from '../FlashCards.vue'
import { StackDirection } from '../utils/useStackTransform'

/**
 * Default configuration values for FlashCards
 */
export const flashCardsDefaults = (
  {
    renderLimit: 3,
    swipeThreshold: 150,
    dragThreshold: 5,
    swipeDirection: 'horizontal',
    maxRotation: 20,
    stack: 0,
    stackOffset: 20,
    stackScale: 0.05,
    stackDirection: StackDirection.BOTTOM,
    itemKey: 'id',
    loop: undefined,
    waitAnimationEnd: undefined,
    resistance: null,
    velocity: undefined,
    a11y: undefined,
  } as const
) satisfies FlashCardsProps<any>

/**
 * Internal tuning defaults for grouped props. These are the fallbacks used when
 * a grouped prop (`resistance`, `velocity`) is enabled but a field is omitted —
 * they are NOT public props themselves.
 */
export const resistanceDefaults = {
  threshold: 150,
  strength: 0.3,
} as const

export const velocityDefaults = {
  enabled: true,
  threshold: 0.5,
} as const

/**
 * Accessibility defaults. The `a11y` prop is on by default — these are the
 * fallbacks used when it's omitted or only partially specified. Labels are the
 * English defaults; pass an `a11y.labels` object to localize them.
 *
 * `announce` receives the deck event and the labels and returns the string read
 * out by the live region (or `null`/`''` to stay silent for that event).
 */
export const a11yDefaults = {
  // Master switch. `false` opts out of ALL a11y wiring (roles, live region,
  // keyboard, focus) for users who want to supply their own.
  enabled: true,
  // Keyboard navigation (arrows / Enter / Space / restore keys).
  keyboard: true,
  // When `true`, an arrow key first peeks the card to the full pre-swipe pose
  // and waits for Enter/Space (or another arrow) to confirm; Escape cancels.
  // When `false`, an arrow key swipes immediately.
  confirmOnKey: false,
  // Move focus to the next active card after a keyboard-driven swipe.
  manageFocus: true,
  // aria-live politeness for the announcement region.
  liveMode: 'polite' as 'polite' | 'assertive',
  labels: {
    deck: 'Card deck',
    card: 'Card',
    top: 'up',
    left: 'left',
    right: 'right',
    bottom: 'down',
    skip: 'skipped',
    restore: 'restored',
    empty: 'No more cards',
    instructions: 'Use arrow keys to swipe the card, Enter to confirm.',
  },
} as const

export type A11yLabels = typeof a11yDefaults.labels
