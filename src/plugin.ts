import type { App, Component } from 'vue'
import type { FlashCardsProps } from './FlashCards.vue'
import type { FlipCardProps } from './FlipCard.vue'
import FlashCards from './FlashCards.vue'
import FlipCard from './FlipCard.vue'
import { FlashCardsConfigKey, FlipCardConfigKey } from './utils/useConfig'

export interface FlipCardConfig {
  // Disable card flipping functionality
  disabled?: boolean
  // Wait for animation to end before can flip card again
  waitAnimationEnd?: boolean
  // Flip axis
  flipAxis?: 'x' | 'y'
}

export interface FlashCardsPluginOptions<T = any> {
  // Global configuration for FlashCards
  flashCards?: FlashCardsProps<T>
  // Global configuration for FlipCard
  flipCard?: FlipCardProps
  // Whether to register components globally (default: true)
  registerComponents?: boolean
}

export default function install(app: App, options: FlashCardsPluginOptions = {}) {
  const { flashCards = {}, flipCard = {}, registerComponents = true } = options

  // Provide global configs with typed keys
  app.provide(FlashCardsConfigKey, flashCards)
  app.provide(FlipCardConfigKey, flipCard)

  // Register components globally if enabled
  if (registerComponents) {
    app.component('FlashCards', FlashCards as Component)
    app.component('FlipCard', FlipCard as Component)
  }
}

// Export for manual registration
export { FlashCards, FlashCardsConfigKey, FlipCard, FlipCardConfigKey }
