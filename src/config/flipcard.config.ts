import type { FlipCardProps } from '../FlipCard.vue'

/**
 * Default configuration values for FlipCard
 */
export const flipCardDefaults = (
  {
    disabled: undefined,
    waitAnimationEnd: true,
    flipAxis: 'y' as const,
  } as const
) satisfies FlipCardProps
