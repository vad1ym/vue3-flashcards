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
    maxRotation: 20,
    stack: 0,
    stackOffset: 20,
    stackScale: 0.05,
    stackDirection: StackDirection.BOTTOM,
    trackBy: 'id',
    infinite: undefined,
    waitAnimationEnd: undefined,
  } as const
) satisfies FlashCardsProps<any>
