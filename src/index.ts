// Export Vue plugin
export { default as FlashCardsPlugin } from './plugin'

// Export components for manual registration
export { FlashCards, FlashCardsConfigKey, FlipCard, FlipCardConfigKey } from './plugin'

// Export types
export type { FlashCardsPluginOptions, FlipCardConfig } from './plugin'

// Export WAAPI animation customization API
export { defaultAnimationKeyframes } from './utils/animationKeyframes'
export type { AnimationContext, AnimationKeyframes } from './utils/animationKeyframes'
