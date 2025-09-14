import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { parseTranslate3D } from '../utils/test-helpers'

describe('[props] stackOffset', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackOffset (20px)', () => {
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

    it('should apply default offset to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should find cards with translate transforms that create offset effect
      let hasOffsetCards = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Skip active card, check within stack range
          const style = cardWrapper.attributes('style')
          const translateValue = parseTranslate3D(style)
          if (translateValue && (translateValue.x !== 0 || translateValue.y !== 0)) {
            hasOffsetCards = true
          }
        }
      })

      expect(hasOffsetCards).toBe(true)
    })

    it('should apply progressive offsets to stacked cards', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Extract offset values from background cards
      const offsetValues: Array<{ x: number, y: number }> = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Skip active card, check up to 3 background cards
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            offsetValues.push({
              x: Math.abs(parsed.x),
              y: Math.abs(parsed.y),
            })
          }
        }
      })

      // Should have increasing offsets based on default stackOffset (20px)
      expect(offsetValues.length).toBeGreaterThan(0)

      // Each level should have larger offset than the previous
      for (let i = 1; i < offsetValues.length; i++) {
        const prevOffset = Math.max(offsetValues[i - 1].x, offsetValues[i - 1].y)
        const currentOffset = Math.max(offsetValues[i].x, offsetValues[i].y)
        expect(currentOffset).toBeGreaterThan(prevOffset)
      }
    })

    it('should use default stackDirection (bottom) for offsets', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // With bottom direction, should have positive Y offsets
      let hasBottomOffsets = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && parsed.y > 0) {
            hasBottomOffsets = true
          }
        }
      })

      expect(hasBottomOffsets).toBe(true)
    })
  })

  describe('with custom stackOffset of 40px', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackOffset: 40,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom stackOffset value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Check for offset values that are multiples of custom offset
      let foundExpectedOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
            // Should be multiple of custom offset (40px)
            if (offsetValue >= 40 && offsetValue % 40 === 0) {
              foundExpectedOffset = true
            }
          }
        }
      })

      expect(foundExpectedOffset).toBe(true)
    })

    it('should apply larger offsets than default', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should have larger offsets than default (20px)
      let hasLargerOffsets = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
            if (offsetValue > 20) { // Larger than default
              hasLargerOffsets = true
            }
          }
        }
      })

      expect(hasLargerOffsets).toBe(true)
    })

    it('should maintain incremental offsets based on custom value', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      const offsetValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Check background cards
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
            offsetValues.push(offsetValue)
          }
        }
      })

      // With stackOffset=40, expect values like 40, 80, 120
      if (offsetValues.length >= 2) {
        const diff = offsetValues[1] - offsetValues[0]
        expect(diff).toBe(40)
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
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Check that no meaningful offsets are applied
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            expect(parsed.x).toBe(0)
            expect(parsed.y).toBe(0)
          }
        }
      })
    })

    it('should still apply scale transforms without offset', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should still have scale transforms even without offsets
      let hasScaleTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (style && style.includes('scale(') && !style.includes('scale(1)')) {
            hasScaleTransforms = true
          }
        }
      })

      expect(hasScaleTransforms).toBe(true)
    })
  })

  describe('with negative stackOffset', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: -30,
          stackDirection: 'bottom', // Negative offset should reverse the direction
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should apply negative offsets in reverse direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Look for negative offset values (reverse direction)
      let foundNegativeOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && (parsed.x < 0 || parsed.y < 0)) {
            foundNegativeOffset = true
          }
        }
      })

      expect(foundNegativeOffset).toBe(true)
    })

    it('should maintain incremental negative spacing', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      const offsetValues: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 2) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            // Keep the sign for negative values
            const offsetValue = parsed.y !== 0 ? parsed.y : parsed.x
            offsetValues.push(offsetValue)
          }
        }
      })

      // With negative stackOffset, values should be increasingly negative
      if (offsetValues.length >= 2) {
        expect(offsetValues[0]).toBeLessThan(0)
        expect(offsetValues[1]).toBeLessThan(offsetValues[0]) // More negative
      }
    })
  })

  describe('stackOffset with no stack', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 0, // No stacking
          stackOffset: 50, // Large offset value but shouldn't apply
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply offset transforms when stack is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        // Should not have meaningful translate transforms
        if (style && style.includes('translate3D')) {
          // May have translate3D(0,0,0) for positioning but no real offset
          const parsed = parseTranslate3D(style)
          if (parsed) {
            expect(parsed.x).toBe(0)
            expect(parsed.y).toBe(0)
          }
        }
      })
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

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')
      expect(cardWrappers.length).toBeGreaterThanOrEqual(2)

      // Should have exactly one background card with offset transform
      let foundOffsetCard = false
      let offsetValue = 0

      cardWrappers.forEach((cardWrapper, index) => {
        if (index === 1) { // First background card with stack=1
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && (Math.abs(parsed.x) > 0 || Math.abs(parsed.y) > 0)) {
            foundOffsetCard = true
            offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
          }
        }
      })

      expect(foundOffsetCard).toBe(true)
      expect(offsetValue).toBeGreaterThan(0) // Should have some offset applied
    })

    it('should handle large stack sizes with consistent offset progression', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 4,
          stackOffset: 15,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Collect offset values from all stacked cards
      const offsetProgression: number[] = []
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 4) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
            offsetProgression.push(offsetValue)
          }
        }
      })

      // Should have increasing offsets
      if (offsetProgression.length >= 2) {
        for (let i = 1; i < offsetProgression.length; i++) {
          expect(offsetProgression[i]).toBeGreaterThan(offsetProgression[i - 1])
        }
      }
    })
  })

  describe('edge cases', () => {
    it('should handle very large stackOffset values', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: 200, // Very large offset
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should apply large offsets without breaking
      let foundLargeOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed) {
            const offsetValue = Math.max(Math.abs(parsed.x), Math.abs(parsed.y))
            if (offsetValue >= 200) {
              foundLargeOffset = true
            }
          }
        }
      })

      expect(foundLargeOffset).toBe(true)
    })

    it('should handle fractional stackOffset values', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: 12.5, // Fractional offset
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper')

      // Should handle fractional values - just check that offsets are applied
      let foundOffset = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Any background card
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && (Math.abs(parsed.x) > 0 || Math.abs(parsed.y) > 0)) {
            foundOffset = true
          }
        }
      })

      expect(foundOffset).toBe(true)
    })
  })
})
