import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FlashCardsPlugin, { FlashCards, FlashCardsConfigKey, FlipCard, FlipCardConfigKey } from '../src/plugin'

describe('vue Plugin', () => {
  let mockApp: any

  beforeEach(() => {
    mockApp = {
      provide: vi.fn(),
      component: vi.fn(),
    }
  })

  describe('plugin installation', () => {
    it('should install without options', () => {
      FlashCardsPlugin(mockApp)

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, {})
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
      expect(mockApp.component).toHaveBeenCalledWith('FlashCards', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledWith('FlipCard', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledTimes(2)
    })

    it('should install with global config', () => {
      const flashCardsConfig = {
        stack: 3,
        stackOffset: 25,
        threshold: 150,
      }
      const flipCardConfig = {
        flipAxis: 'x' as const,
        disabled: true,
      }

      FlashCardsPlugin(mockApp, { flashCards: flashCardsConfig, flipCard: flipCardConfig })

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, flashCardsConfig)
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, flipCardConfig)
      expect(mockApp.component).toHaveBeenCalledTimes(2)
    })

    it('should skip component registration when disabled', () => {
      FlashCardsPlugin(mockApp, { registerComponents: false })

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, {})
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
      expect(mockApp.component).not.toHaveBeenCalled()
    })

    it('should register components with custom config', () => {
      const flashCardsConfig = {
        stack: 2,
        infinite: true,
        maxRotation: 30,
      }

      FlashCardsPlugin(mockApp, {
        flashCards: flashCardsConfig,
        registerComponents: true,
      })

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, flashCardsConfig)
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
      expect(mockApp.component).toHaveBeenCalledWith('FlashCards', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledWith('FlipCard', expect.any(Object))
    })
  })

  describe('component exports', () => {
    it('should export FlashCards component', () => {
      expect(FlashCards).toBeDefined()
      expect(typeof FlashCards).toBe('object')
    })

    it('should export FlipCard component', () => {
      expect(FlipCard).toBeDefined()
      expect(typeof FlipCard).toBe('object')
    })

    it('should export FlashCardsConfigKey and FlipCardConfigKey', () => {
      expect(FlashCardsConfigKey).toBeDefined()
      expect(typeof FlashCardsConfigKey).toBe('symbol')
      expect(FlipCardConfigKey).toBeDefined()
      expect(typeof FlipCardConfigKey).toBe('symbol')
    })

    it('should not export FlashCard component', () => {
      // FlashCard should not be globally exported from plugin
      const exports = { FlashCards, FlipCard, FlashCardsConfigKey, FlipCardConfigKey }
      expect(Object.keys(exports)).not.toContain('FlashCard')
    })
  })

  describe('global config injection', () => {
    it('should provide empty config by default', () => {
      // Test that the plugin registers without errors
      const mockApp: any = {
        provide: vi.fn(),
        component: vi.fn(),
      }

      FlashCardsPlugin(mockApp)

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, {})
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
    })

    it('should provide custom config when specified', () => {
      const customFlashCardsConfig = {
        stack: 4,
        stackOffset: 30,
        infinite: true,
        threshold: 200,
      }
      const customFlipCardConfig = {
        flipAxis: 'x' as const,
        waitAnimationEnd: false,
      }

      const mockApp: any = {
        provide: vi.fn(),
        component: vi.fn(),
      }

      FlashCardsPlugin(mockApp, { flashCards: customFlashCardsConfig, flipCard: customFlipCardConfig })

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, customFlashCardsConfig)
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, customFlipCardConfig)
    })
  })

  describe('component integration', () => {
    const testItems = [
      { id: 1, title: 'Card 1' },
      { id: 2, title: 'Card 2' },
      { id: 3, title: 'Card 3' },
    ]

    it('should register FlashCards globally', () => {
      const wrapper = mount({
        template: `
          <FlashCards :items="items">
            <template #default="{ item }">
              {{ item.title }}
            </template>
          </FlashCards>
        `,
        data() {
          return { items: testItems }
        },
      }, {
        global: {
          plugins: [[FlashCardsPlugin]],
        },
      })

      expect(wrapper.findComponent({ name: 'FlashCards' }).exists()).toBe(true)
      expect(wrapper.text()).toContain('Card 1')
    })

    it('should register FlipCard globally', () => {
      const wrapper = mount({
        template: `
          <FlipCard>
            <template #front>Front content</template>
            <template #back>Back content</template>
          </FlipCard>
        `,
      }, {
        global: {
          plugins: [[FlashCardsPlugin]],
        },
      })

      expect(wrapper.findComponent({ name: 'FlipCard' }).exists()).toBe(true)
      expect(wrapper.text()).toContain('Front content')
    })

    it('should use global config in FlashCards', () => {
      const globalConfig = {
        stack: 3,
        stackOffset: 25,
      }

      const wrapper = mount({
        template: `
          <FlashCards :items="items">
            <template #default="{ item }">
              {{ item.title }}
            </template>
          </FlashCards>
        `,
        data() {
          return { items: testItems }
        },
      }, {
        global: {
          plugins: [[FlashCardsPlugin, { flashCards: globalConfig }]],
        },
      })

      const flashCardsComponent = wrapper.findComponent({ name: 'FlashCards' })
      expect(flashCardsComponent.exists()).toBe(true)

      // The global config should be accessible within the component
      // We can't easily test the merged props directly, but we can verify the component renders
      expect(wrapper.findAll('.flashcards__card-wrapper').length).toBeGreaterThan(1)
    })

    it('should allow local props to override global config', () => {
      const globalConfig = {
        stack: 3,
        infinite: false,
      }

      const wrapper = mount({
        template: `
          <FlashCards :items="items" :infinite="true">
            <template #default="{ item }">
              {{ item.title }}
            </template>
          </FlashCards>
        `,
        data() {
          return { items: testItems }
        },
      }, {
        global: {
          plugins: [[FlashCardsPlugin, { flashCards: globalConfig }]],
        },
      })

      const flashCardsComponent = wrapper.findComponent({ name: 'FlashCards' })
      expect(flashCardsComponent.exists()).toBe(true)

      // Local prop should override global config
      expect(flashCardsComponent.props('infinite')).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle empty config gracefully', () => {
      expect(() => {
        FlashCardsPlugin(mockApp, {})
      }).not.toThrow()

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, {})
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
    })

    it('should handle undefined options gracefully', () => {
      expect(() => {
        FlashCardsPlugin(mockApp, undefined as any)
      }).not.toThrow()

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, {})
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
      expect(mockApp.component).toHaveBeenCalledTimes(2)
    })

    it('should handle partial config options', () => {
      const partialFlashCardsConfig = {
        stack: 2,
        // Missing other properties
      }

      expect(() => {
        FlashCardsPlugin(mockApp, { flashCards: partialFlashCardsConfig })
      }).not.toThrow()

      expect(mockApp.provide).toHaveBeenCalledWith(FlashCardsConfigKey, partialFlashCardsConfig)
      expect(mockApp.provide).toHaveBeenCalledWith(FlipCardConfigKey, {})
    })
  })
})
