import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { DragSimulator } from '../utils/drag-simular'
import { parseScale, parseTranslate3D } from '../utils/test-helpers'

describe('[props] stack', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stack (0)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 0, // No stacking
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply stacking transforms when stack is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check that no stacking transforms are applied
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        // With stack=0, should not have scale or offset transforms
        expect(style).not.toMatch(/scale|translate/)
      })
    })

    it('should render cards without visual stacking effect', () => {
      // All cards should have same z-index pattern without stacking offsets
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBeGreaterThan(1)

      // Cards should still be layered (z-index) but no visual stacking
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        expect(style).toMatch(/z-index/)
      })
    })
  })

  describe('with stack of 2', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          virtualBuffer: 4, // Ensure enough cards are rendered for stacking
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply stacking transforms to background cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(5) // virtualBuffer=4 + 1 for transitions

      // First card (active) should not have stacking transform
      const activeCardStyle = cardWrappers[0].attributes('style')
      expect(activeCardStyle).toMatch(/z-index:\s*0/) // Active card has highest z-index

      // Background cards should have stacking transforms
      for (let i = 1; i < Math.min(3, cardWrappers.length); i++) {
        const cardStyle = cardWrappers[i].attributes('style')
        expect(cardStyle).toMatch(/transform:/)
        expect(cardStyle).toMatch(/scale|translate/)
      }
    })

    it('should maintain stacking visual hierarchy', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check z-index ordering (active card should have highest z-index = 0)
      const zIndexes: number[] = []
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const zIndexMatch = style?.match(/z-index:\s*(-?\d+)/)
        if (zIndexMatch) {
          zIndexes.push(Number.parseInt(zIndexMatch[1]))
        }
      })

      // z-indexes should decrease (0, -1, -2, -3, etc.)
      for (let i = 1; i < zIndexes.length; i++) {
        expect(zIndexes[i]).toBeLessThan(zIndexes[i - 1])
      }
    })

    it('should update stacking after card swipe', async () => {
      // Get initial card arrangement
      const initialActive = wrapper.find('.flashcards__card--active')
      expect(initialActive.text()).toContain('Card 1')

      // Swipe the active card
      const activeCard = wrapper.find('.flashcards__card--active')
      new DragSimulator(activeCard).swipeApprove()
      await wrapper.vm.$nextTick()

      // Card 2 should now be active
      const newActive = wrapper.find('.flashcards__card--active')
      expect(newActive.text()).toContain('Card 2')

      // Stacking should still be applied to remaining cards
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      let hasStackingTransforms = false

      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        if (style?.match(/transform:.*scale|transform:.*translate/)) {
          hasStackingTransforms = true
        }
      })

      expect(hasStackingTransforms).toBe(true)
    })
  })

  describe('with stack larger than virtualBuffer', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 5, // Stack larger than default virtualBuffer
          virtualBuffer: 3, // Will be auto-adjusted to stack + 1 = 6
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should automatically adjust virtualBuffer to accommodate stack', () => {
      // With stack=5, virtualBuffer should be adjusted to 6 (stack + 1)
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      expect(cardWrappers.length).toBe(5) // Limited by available items, but logic works
    })

    it('should apply stacking to all visible background cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // All background cards should have stacking transforms
      let stackedCardsCount = 0
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (style?.match(/transform:.*scale|transform:.*translate/)) {
            stackedCardsCount++
          }
        }
      })

      expect(stackedCardsCount).toBeGreaterThan(0)
    })
  })

  describe('with stack of 1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply minimal stacking with stack of 1', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should have at least 2 cards rendered (active + 1 stacked)
      expect(cardWrappers.length).toBeGreaterThanOrEqual(2)

      // Only the first background card should have stacking transform
      const firstBgCard = cardWrappers[1]
      const firstBgStyle = firstBgCard.attributes('style')
      expect(firstBgStyle).toMatch(/transform:/)

      // With stack=1, all background cards should get the same stacking transform values
      // (This is different from higher stack values where cards get progressive transforms)
      if (cardWrappers.length > 2) {
        const firstBgTransform = parseTranslate3D(firstBgStyle)
        const firstBgScale = parseScale(firstBgStyle)

        for (let i = 2; i < cardWrappers.length; i++) {
          const cardStyle = cardWrappers[i].attributes('style')
          const cardTransform = parseTranslate3D(cardStyle)
          const cardScale = parseScale(cardStyle)

          // With stack=1, all background cards should have identical transform values
          if (firstBgTransform && cardTransform) {
            expect(cardTransform).toEqual(firstBgTransform)
          }

          if (firstBgScale && cardScale) {
            expect(cardScale).toEqual(firstBgScale)
          }
        }
      }
    })
  })

  describe('stacking behavior in infinite mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Use fewer items to test cycling
          stack: 2,
          infinite: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should maintain stacking visual effects during infinite cycling', async () => {
      // Swipe through several cards to trigger cycling
      for (let i = 0; i < 5; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        new DragSimulator(activeCard).swipeApprove()
        await wrapper.vm.$nextTick()
      }

      // Stacking should still be applied
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')
      let hasStackingEffects = false

      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        if (style?.match(/transform:.*scale|transform:.*translate/)) {
          hasStackingEffects = true
        }
      })

      expect(hasStackingEffects).toBe(true)
    })
  })
})
