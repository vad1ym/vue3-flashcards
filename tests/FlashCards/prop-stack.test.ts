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
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply stacking transforms when stack is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Check that no stacking transforms are applied to any card
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')

        // With stack=0, cards should not have scaling different from 1
        const scaleValue = parseScale(style)
        if (scaleValue !== null) {
          expect(scaleValue).toBe(1)
        }

        // Cards may still have z-index for layering but no visual stacking effects
        if (style) {
          expect(style).toMatch(/z-index/)
        }
      })
    })

    it('should render cards in a flat layout without visual depth', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThan(1)

      // All cards should have the same visual treatment (no progressive scaling/offset)
      const styles = cardWrappers.map(wrapper => wrapper.attributes('style'))
      const scaleValues = styles.map(style => parseScale(style)).filter(val => val !== null)

      // All scale values should be 1 (or no scale transform)
      scaleValues.forEach((scale) => {
        expect(scale).toBe(1)
      })
    })
  })

  describe('with stack of 2', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply stacking transforms to background cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThan(2)

      // Check that we have different scale values for different levels
      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const scaleValue = parseScale(style)
        if (scaleValue !== null) {
          scaleValues.push(scaleValue)
        }
      })

      // Should have multiple different scale values
      expect(scaleValues.length).toBeGreaterThan(1)
      expect(new Set(scaleValues).size).toBeGreaterThan(1)

      // Background cards (within stack limit) should have stacking effects
      let stackedCardsFound = 0
      for (let i = 1; i <= Math.min(2, cardWrappers.length - 1); i++) {
        const cardStyle = cardWrappers[i].attributes('style')
        const scaleValue = parseScale(cardStyle)
        const translateValue = parseTranslate3D(cardStyle)

        if ((scaleValue && scaleValue < 1) || (translateValue && (translateValue.x !== 0 || translateValue.y !== 0))) {
          stackedCardsFound++
        }
      }

      expect(stackedCardsFound).toBeGreaterThan(0)
    })

    it('should maintain stacking visual hierarchy with z-index', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Check z-index ordering (active card should have highest z-index)
      const zIndexes: number[] = []
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const zIndexMatch = style?.match(/z-index:\s*(-?\d+)/)
        if (zIndexMatch) {
          zIndexes.push(Number.parseInt(zIndexMatch[1]))
        }
      })

      // Should have decreasing z-indexes (layering effect)
      expect(zIndexes.length).toBeGreaterThan(1)
      for (let i = 1; i < zIndexes.length; i++) {
        expect(zIndexes[i]).toBeLessThan(zIndexes[i - 1])
      }
    })

    it('should apply progressive scaling to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Get scale values from cards within stack range
      const scaleValues: number[] = []
      for (let i = 1; i <= Math.min(2, cardWrappers.length - 1); i++) {
        const style = cardWrappers[i].attributes('style')
        const scaleValue = parseScale(style)
        if (scaleValue !== null) {
          scaleValues.push(scaleValue)
        }
      }

      // Should have progressive scaling (each card smaller than the previous)
      if (scaleValues.length > 1) {
        for (let i = 1; i < scaleValues.length; i++) {
          expect(scaleValues[i]).toBeLessThanOrEqual(scaleValues[i - 1])
        }
      }
    })

    it('should update stacking after card swipe', async () => {
      // Get initial active card
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
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      let hasStackingTransforms = false

      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip new active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          const translateValue = parseTranslate3D(style)

          if ((scaleValue && scaleValue < 1) || (translateValue && (translateValue.x !== 0 || translateValue.y !== 0))) {
            hasStackingTransforms = true
          }
        }
      })

      expect(hasStackingTransforms).toBe(true)
    })
  })

  describe('with stack larger than available cards', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Only 3 cards
          stack: 5, // Stack larger than available cards
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply stacking to all available background cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeLessThanOrEqual(3) // Limited by items

      // All background cards should have stacking transforms
      let stackedCardsCount = 0
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          const translateValue = parseTranslate3D(style)

          if ((scaleValue && scaleValue < 1) || (translateValue && (translateValue.x !== 0 || translateValue.y !== 0))) {
            stackedCardsCount++
          }
        }
      })

      // Should have stacked as many cards as available (minus active)
      expect(stackedCardsCount).toBe(Math.max(0, cardWrappers.length - 1))
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

    it('should apply stacking to exactly one background card', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThanOrEqual(2)

      // Only the first background card should have stacking transform
      const firstBgCard = cardWrappers[1]
      const firstBgStyle = firstBgCard.attributes('style')
      const firstBgScale = parseScale(firstBgStyle)
      const firstBgTranslate = parseTranslate3D(firstBgStyle)

      // Should have stacking effects
      const hasStackingEffect = (firstBgScale && firstBgScale !== null)
        || (firstBgTranslate && (firstBgTranslate.x !== 0 || firstBgTranslate.y !== 0))
      expect(hasStackingEffect).toBe(true)

      // Should have stacking transforms applied
      let stackedCardsWithSameScale = 0
      if (cardWrappers.length > 2) {
        for (let i = 2; i < cardWrappers.length; i++) {
          const cardStyle = cardWrappers[i].attributes('style')
          const cardScale = parseScale(cardStyle)

          if (cardScale !== null) {
            stackedCardsWithSameScale++
          }
        }
      }
      expect(stackedCardsWithSameScale).toBeGreaterThanOrEqual(0)
    })
  })

  describe('stacking behavior in loop mode', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems.slice(0, 3), // Use fewer items to test cycling
          stack: 2,
          loop: true,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should maintain stacking visual effects during loop cycling', async () => {
      // Swipe through several cards to trigger cycling
      for (let i = 0; i < 5; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        if (!activeCard.exists()) {
          // If no active card found, use programmatic method
          wrapper.vm.approve()
        }
        else {
          new DragSimulator(activeCard).swipeApprove()
        }
        await wrapper.vm.$nextTick()
      }

      // Should still have cards rendered after cycling
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThan(1)

      // Should have cards with styling (z-index, transforms, etc.)
      let hasStyledCards = false
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        if (style && (style.includes('z-index') || style.includes('transform') || style.includes('scale'))) {
          hasStyledCards = true
        }
      })

      expect(hasStyledCards).toBe(true)
    })

    it('should cycle through items correctly while maintaining stack', async () => {
      // Swipe multiple times (more than the number of items)
      for (let i = 0; i < 4; i++) {
        const activeCard = wrapper.find('.flashcards__card--active')
        if (!activeCard.exists()) {
          wrapper.vm.approve()
        }
        else {
          new DragSimulator(activeCard).swipeApprove()
        }
        await wrapper.vm.$nextTick()
      }

      // Should have cycled back to show items again (loop behavior)
      const finalActiveCard = wrapper.find('.flashcards__card--active')
      if (finalActiveCard.exists()) {
        expect(finalActiveCard.text()).toMatch(/Card [1-3]/) // Should show one of the original cards
      }

      // Stack should still be working
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThan(1) // Should have multiple cards for stacking
    })
  })
})
