import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { hasTranslate3DOffset, parseTranslate3D } from '../utils/test-helpers'

describe('[props] stackOffset', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackOffset', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2, // Enable stacking to see offset effects
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use default stackOffset of 20px from config', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check that background cards have offset transforms in translate3D
      let foundOffsetTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasTranslate3DOffset(style)) {
            foundOffsetTransform = true
          }
        }
      })

      expect(foundOffsetTransform).toBe(true)
    })

    it('should apply increasing offsets to stacked cards with default value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Extract Y values from translate3D in background cards
      const translateYValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) { // Skip active card, check up to 2 background cards for stack=2
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            translateYValues.push(Math.abs(parsed.y))
          }
        }
      })

      // Should have increasing offsets (20px, 40px, 60px with default stackOffset=20)
      expect(translateYValues.length).toBeGreaterThan(0)
      for (let i = 1; i < translateYValues.length; i++) {
        expect(Math.abs(translateYValues[i])).toBeGreaterThan(Math.abs(translateYValues[i - 1]))
      }
    })
  })

  describe('with custom stackOffset of 10px', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackOffset: 10,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom stackOffset value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check for Y values with multiples of 10 in translate3D
      let foundExpectedOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.abs(parsed.y)
            // Should be multiple of 10 (10, 20, 30...)
            if (offsetValue % 10 === 0 && offsetValue > 0) {
              foundExpectedOffset = true
            }
          }
        }
      })

      expect(foundExpectedOffset).toBe(true)
    })

    it('should apply incremental offsets based on custom stackOffset', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      const translateYValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Check background cards
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            translateYValues.push(Math.abs(parsed.y))
          }
        }
      })

      // With stackOffset=10, expect values like 10, 20, 30
      if (translateYValues.length >= 2) {
        const diff = translateYValues[1] - translateYValues[0]
        expect(diff).toBe(10)
      }
    })
  })

  describe('with stackOffset of 0', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackOffset: 0,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply any offset when stackOffset is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Check that no Y offsets are applied in translate3D
      let hasYOffset = false
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        if (hasTranslate3DOffset(style)) {
          hasYOffset = true
        }
      })

      expect(hasYOffset).toBe(false)
    })

    it('should still apply scale transforms without offset', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should still have scale transforms even without offsets
      let hasScale = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (style?.match(/scale/)) {
            hasScale = true
          }
        }
      })

      expect(hasScale).toBe(true)
    })
  })

  describe('with large stackOffset', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: 50, // Large offset
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply large offsets correctly', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for large Y values in translate3D
      let foundLargeOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && Math.abs(parsed.y) >= 50) {
            foundLargeOffset = true
          }
        }
      })

      expect(foundLargeOffset).toBe(true)
    })

    it('should maintain proportional spacing with large offsets', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      const translateYValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) { // Check background cards with stack=2
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            translateYValues.push(Math.abs(parsed.y))
          }
        }
      })

      // Should have spacing of 50px between each level
      if (translateYValues.length >= 2) {
        const diff = translateYValues[1] - translateYValues[0]
        expect(diff).toBe(50)
      }
    })
  })

  describe('with negative stackOffset', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: -15, // Negative offset (reverse direction)
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply negative offsets in reverse direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for negative Y values in translate3D
      let foundNegativeOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && parsed.y < 0) {
            foundNegativeOffset = true
          }
        }
      })

      expect(foundNegativeOffset).toBe(true)
    })

    it('should maintain incremental negative spacing', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      const translateYValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            translateYValues.push(parsed.y) // Keep sign
          }
        }
      })

      // With negative stackOffset, values should be increasingly negative
      if (translateYValues.length >= 2) {
        expect(translateYValues[0]).toBeLessThan(0)
        expect(translateYValues[1]).toBeLessThan(translateYValues[0]) // More negative
      }
    })
  })

  describe('stackOffset interaction with different stack sizes', () => {
    it('should work correctly with stack=1 and custom offset', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
          stackOffset: 30,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should have exactly one background card with 30px offset
      let found30pxOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index === 1) { // First background card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && Math.abs(parsed.y) === 30) {
            found30pxOffset = true
          }
        }
      })

      expect(found30pxOffset).toBe(true)
    })
  })
})
