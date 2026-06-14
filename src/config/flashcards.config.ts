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
