import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { hasScale, hasScale1, parseScale } from '../utils/test-helpers'

// Test constants for stack scale functionality
const TEST_ITEMS_COUNT = 5
const STACK_SIZE_FOR_SCALE_TESTS = 3 // Stack size to see scale effects
const AGGRESSIVE_SCALE_FACTOR = 0.1 // More aggressive scaling
const NO_SCALE_FACTOR = 0 // No scaling (scale remains 1)
const LARGE_SCALE_REDUCTION = 0.2 // Large scale reduction
const MEDIUM_SCALE_REDUCTION = 0.15 // Medium scale reduction for combination tests
const EXTREME_SCALE_REDUCTION = 0.5 // Very large scale reduction

describe('[props] stackScale', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: TEST_ITEMS_COUNT }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackScale', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: STACK_SIZE_FOR_SCALE_TESTS, // Enable stacking to see scale effects
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use default stackScale of 0.05 from config', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check that background cards have scale transforms
      let foundScaleTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasScale(style)) {
            foundScaleTransform = true
          }
        }
      })

      expect(foundScaleTransform).toBe(true)
    })

    it('should apply decreasing scales to stacked cards with default value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Extract scale values from background cards
      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Skip active card, check up to 3 background cards
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

      // First background card should be scaled down by 0.05 (scale = 0.95)
      if (scaleValues.length > 0) {
        expect(scaleValues[0]).toBeLessThan(1)
        expect(scaleValues[0]).toBeCloseTo(0.95, 2)
      }
    })

    it('should apply scale(1) to active card', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Active card (first card) should have scale(1) - no reduction
      const activeCardStyle = cardWrappers[0].attributes('style')
      expect(hasScale1(activeCardStyle)).toBe(true)
    })
  })

  describe('with custom stackScale of 0.1', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: AGGRESSIVE_SCALE_FACTOR, // More aggressive scaling
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom stackScale value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Extract scale values
      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // With stackScale=0.1, first background card should be 0.9
      if (scaleValues.length > 0) {
        expect(scaleValues[0]).toBeCloseTo(0.9, 2)
      }
    })

    it('should apply larger scale differences with custom stackScale', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

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

      // With stackScale=0.1, expect values like 0.9, 0.8, 0.7
      if (scaleValues.length >= 2) {
        const diff = scaleValues[0] - scaleValues[1]
        expect(diff).toBeCloseTo(0.1, 2)
      }
    })
  })

  describe('with stackScale of 0', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: NO_SCALE_FACTOR, // No scaling
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply scale(1) when stackScale is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // All cards should have scale(1) when stackScale is 0
      let allHaveScale1 = true
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        if (!hasScale1(style)) {
          allHaveScale1 = false
        }
      })

      expect(allHaveScale1).toBe(true)
    })

    it('should apply stacking transforms with scale(1) when stackScale is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // With stackScale=0 and stack=3, should apply transforms but with scale(1)
      let allHaveScale1Transforms = true
      cardWrappers.forEach((cardWrapper, index) => {
        const style = cardWrapper.attributes('style')
        if (index <= 3) { // Within stack range
          if (!hasScale1(style)) {
            allHaveScale1Transforms = false
          }
        }
      })

      expect(allHaveScale1Transforms).toBe(true)
    })
  })

  describe('with large stackScale', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackScale: LARGE_SCALE_REDUCTION, // Large scale reduction
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply large scale reductions correctly', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for significantly reduced scale values
      let foundLargeScaleReduction = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null && scaleValue <= 0.8) { // 20% or more reduction
            foundLargeScaleReduction = true
          }
        }
      })

      expect(foundLargeScaleReduction).toBe(true)
    })

    it('should maintain proportional scaling with large stackScale', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      const scaleValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) { // Check background cards with stack=2
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue !== null) {
            scaleValues.push(scaleValue)
          }
        }
      })

      // Should have 0.2 difference between each level (0.8, 0.6)
      if (scaleValues.length >= 2) {
        const diff = scaleValues[0] - scaleValues[1]
        expect(diff).toBeCloseTo(0.2, 2)
      }
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
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

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
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

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

  describe('stackScale interaction with different stack sizes', () => {
    it('should work correctly with stack=1 and custom scale', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
          stackScale: MEDIUM_SCALE_REDUCTION,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should have exactly one background card with 0.85 scale
      let found85Scale = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index === 1) { // First background card
          const style = cardWrapper.attributes('style')
          const scaleValue = parseScale(style)
          if (scaleValue === 0.85) {
            found85Scale = true
          }
        }
      })

      expect(found85Scale).toBe(true)
    })

    it('should handle extreme scale values gracefully', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackScale: EXTREME_SCALE_REDUCTION, // Very large scale reduction
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should apply scales (some cards may have very small values with extreme stackScale)
      let hasScaleTransforms = false
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const scaleValue = parseScale(style)
        if (scaleValue !== null) {
          hasScaleTransforms = true
          // Even extreme values should be finite numbers
          expect(Number.isNaN(scaleValue)).toBe(false)
        }
      })

      expect(hasScaleTransforms).toBe(true)
    })
  })
})
