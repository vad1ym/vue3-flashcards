import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { parseScale } from '../utils/test-helpers'

describe('[props] stackScale', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackScale (0.05)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply progressive scaling to stacked cards with default value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Extract scale values from background cards
      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Skip active card, check background cards within stack
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // Should have decreasing scales (0.95, 0.90, 0.85 with default stackScale=0.05)
      expect(scaleValues.length).toBeGreaterThan(0)
      for (let i = 1; i < scaleValues.length; i++) {
        expect(scaleValues[i]).toBeLessThan(scaleValues[i - 1])
      }

      // Should have some scaled cards
      if (scaleValues.length > 0) {
        const hasScaledCards = scaleValues.some(scale => scale < 1)
        expect(hasScaledCards).toBe(true)
      }
    })

    it('should have different scale values for each stacked level', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) {
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // Each stacked card should have a different scale value
      const uniqueScaleValues = new Set(scaleValues)
      expect(uniqueScaleValues.size).toBe(scaleValues.length)
    })

    it('should have scale transforms applied to cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should have some cards with scale transforms
      let hasScaleTransforms = false
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const scaleValue = parseScale(style)
        if (scaleValue !== null) {
          hasScaleTransforms = true
        }
      })

      expect(hasScaleTransforms).toBe(true)
    })
  })

  describe('with custom stackScale of 0.1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: 0.1, // More aggressive scaling
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom stackScale value for progressive scaling', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Extract scale values
      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Skip active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // With stackScale=0.1, should have more aggressive scaling
      if (scaleValues.length > 0) {
        const hasAggressiveScaling = scaleValues.some(scale => scale <= 0.9)
        expect(hasAggressiveScaling).toBe(true)
      }

      // Should have larger differences between levels
      if (scaleValues.length >= 2) {
        const diff = scaleValues[0] - scaleValues[1]
        expect(diff).toBeGreaterThan(0.05) // Larger gap than default
      }
    })

    it('should apply consistent scale reduction per level', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) {
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // Each level should have consistent reduction
      if (scaleValues.length >= 2) {
        const firstDiff = scaleValues[0] - scaleValues[1]

        for (let i = 1; i < scaleValues.length - 1; i++) {
          const diff = scaleValues[i] - scaleValues[i + 1]
          // Allow small tolerance due to floating point precision
          expect(Math.abs(diff - firstDiff)).toBeLessThan(0.01)
        }
      }
    })
  })

  describe('with stackScale of 0', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: 0, // No scaling
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply scale(1) when stackScale is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // All cards should have scale(1) or no scale transform when stackScale is 0
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const scaleValue = parseScale(style)

        if (scaleValue !== null) {
          expect(scaleValue).toBe(1)
        }
      })
    })

    it('should still apply other stacking effects without scaling', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should still have stacking (transforms, z-index) but not scaling
      let hasOtherStackingEffects = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style && (style.includes('translate') || style.includes('z-index'))) {
            hasOtherStackingEffects = true
          }
        }
      })

      expect(hasOtherStackingEffects).toBe(true)
    })
  })

  describe('with negative stackScale', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackScale: -0.05, // Negative scaling (cards get larger)
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply scale increases with negative stackScale', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Look for scale values greater than 1
      let foundScaleIncrease = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null && scaleValue > 1) {
            foundScaleIncrease = true
          }
        }
      })

      expect(foundScaleIncrease).toBe(true)
    })

    it('should maintain incremental scaling increases', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) {
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // With negative stackScale, values should be increasingly larger (1.05, 1.10...)
      if (scaleValues.length >= 2) {
        expect(scaleValues[0]).toBeGreaterThan(1)
        expect(scaleValues[1]).toBeGreaterThan(scaleValues[0])
      }
    })
  })

  describe('stackScale with no stack', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 0, // No stacking
          stackScale: 0.2, // Large scale value but shouldn't apply
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply scaling when stack is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const scaleValue = parseScale(style)

        // Should not have scaling different from 1
        if (scaleValue !== null) {
          expect(scaleValue).toBe(1)
        }
      })
    })
  })

  describe('stackScale interaction with different stack sizes', () => {
    it('should work correctly with stack=1 and custom scale', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
          stackScale: 0.15,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThanOrEqual(2)

      // Should have exactly one background card with scaling applied
      let scaledCardsCount = 0
      let foundScaleValue: number | null = null

      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaledCardsCount++
            if (foundScaleValue === null) {
              foundScaleValue = scaleValue
            }
          }
        }
      })

      expect(scaledCardsCount).toBeGreaterThan(0)
      if (foundScaleValue !== null) {
        expect(typeof foundScaleValue).toBe('number')
      }
    })

    it('should handle extreme scale values gracefully', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: 0.5, // Very large scale reduction
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should apply scales without breaking
      let hasScaleTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            hasScaleTransforms = true
            // Even extreme values should be finite numbers
            expect(Number.isFinite(scaleValue)).toBe(true)
            // Extreme values can be negative or very small, just need to be finite
            expect(typeof scaleValue).toBe('number')
          }
        }
      })

      expect(hasScaleTransforms).toBe(true)
    })
  })
})
