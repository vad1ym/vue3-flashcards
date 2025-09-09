import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCards from '../../src/FlashCards.vue'
import { StackDirection } from '../../src/utils/useStackTransform'
import { hasNegativeXTransform, hasNegativeYTransform, hasPositiveXTransform, hasPositiveYTransform, parseTranslate3D } from '../utils/test-helpers'

// Test constants for stack direction functionality
const TEST_ITEMS_COUNT = 5
const STANDARD_STACK_SIZE = 2 // Standard stack size for most tests
const STANDARD_STACK_OFFSET = 20 // Standard stack offset for basic tests
const LARGE_STACK_OFFSET = 30 // Larger offset for visibility tests
const SMALL_STACK_OFFSET = 15 // Smaller offset for comparison tests
const NO_STACK_OFFSET = 0 // Zero offset for testing no spacing
const STACK_OFFSET_FOR_SCALE_TEST = 25 // Offset for scale combination tests
const AGGRESSIVE_SCALE_FACTOR = 0.1 // More aggressive scaling factor

describe('[props] stackDirection', () => {
  let wrapper: VueWrapper

  const testItems = Array.from({ length: TEST_ITEMS_COUNT }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
  }))

  describe('with default stackDirection (BOTTOM)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: STANDARD_STACK_SIZE,
          stackOffset: STANDARD_STACK_OFFSET,
          // stackDirection defaults to StackDirection.BOTTOM
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should stack cards downward with BOTTOM direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for positive Y values in translate3D (moving down)
      let foundPositiveY = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasPositiveYTransform(style)) {
            foundPositiveY = true
          }
        }
      })

      expect(foundPositiveY).toBe(true)
    })

    it('should use translate3D with Y axis for BOTTOM direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for translate3D with Y axis movement (format: translate3D(0, Npx, 0))
      let foundBottomTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style?.match(/translate3D\(0,\s*\d+px,\s*0\)/)) {
            foundBottomTransform = true
          }
        }
      })

      expect(foundBottomTransform).toBe(true)
    })
  })

  describe('with stackDirection TOP', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: STANDARD_STACK_SIZE,
          stackOffset: STANDARD_STACK_OFFSET,
          stackDirection: StackDirection.TOP,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should stack cards upward with TOP direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for negative Y values in translate3D (moving up)
      let foundNegativeY = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasNegativeYTransform(style)) {
            foundNegativeY = true
          }
        }
      })

      expect(foundNegativeY).toBe(true)
    })

    it('should use translate3D with negative Y axis for TOP direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for translate3D with negative Y axis movement (format: translate3D(0, -Npx, 0))
      let foundTopTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style?.match(/translate3D\(0,\s*-\d+px,\s*0\)/)) {
            foundTopTransform = true
          }
        }
      })

      expect(foundTopTransform).toBe(true)
    })
  })

  describe('with stackDirection LEFT', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: STANDARD_STACK_SIZE,
          stackOffset: STANDARD_STACK_OFFSET,
          stackDirection: StackDirection.LEFT,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should stack cards leftward with LEFT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for negative X values in translate3D (moving left)
      let foundNegativeX = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasNegativeXTransform(style)) {
            foundNegativeX = true
          }
        }
      })

      expect(foundNegativeX).toBe(true)
    })

    it('should use translate3D with negative X axis for LEFT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for translate3D with negative X axis movement (format: translate3D(-Npx, 0, 0))
      let foundLeftTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style?.match(/translate3D\(-\d+px,\s*0,\s*0\)/)) {
            foundLeftTransform = true
          }
        }
      })

      expect(foundLeftTransform).toBe(true)
    })

    it('should not apply Y-axis transforms with LEFT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Y values in translate3D should be 0
      let allYValuesZero = true
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && parsed.y !== 0) {
            allYValuesZero = false
          }
        }
      })

      expect(allYValuesZero).toBe(true)
    })
  })

  describe('with stackDirection RIGHT', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: STANDARD_STACK_SIZE,
          stackOffset: STANDARD_STACK_OFFSET,
          stackDirection: StackDirection.RIGHT,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should stack cards rightward with RIGHT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for positive X values in translate3D (moving right)
      let foundPositiveX = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (hasPositiveXTransform(style)) {
            foundPositiveX = true
          }
        }
      })

      expect(foundPositiveX).toBe(true)
    })

    it('should use translate3D with positive X axis for RIGHT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Look for translate3D with positive X axis movement (format: translate3D(Npx, 0, 0))
      let foundRightTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          if (style?.match(/translate3D\(\d+px,\s*0,\s*0\)/)) {
            foundRightTransform = true
          }
        }
      })

      expect(foundRightTransform).toBe(true)
    })

    it('should not apply Y-axis transforms with RIGHT direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Y values in translate3D should be 0
      let allYValuesZero = true
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) {
          const style = cardWrapper.attributes('style')
          const parsed = parseTranslate3D(style)
          if (parsed && parsed.y !== 0) {
            allYValuesZero = false
          }
        }
      })

      expect(allYValuesZero).toBe(true)
    })
  })

  describe('stackDirection with different stack sizes', () => {
    it('should apply direction consistently with stack=1', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 1,
          stackOffset: LARGE_STACK_OFFSET,
          stackDirection: StackDirection.TOP,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should have one background card with TOP direction transform
      let foundTopTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index === 1) { // First background card
          const style = cardWrapper.attributes('style')
          if (style?.match(/translate3D\(0,\s*-30px,\s*0\)/)) {
            foundTopTransform = true
          }
        }
      })

      expect(foundTopTransform).toBe(true)
    })

    it('should handle direction changes between cards', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 3,
          stackOffset: SMALL_STACK_OFFSET,
          stackDirection: StackDirection.LEFT,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // All background cards should have LEFT direction transforms
      let allHaveLeftTransforms = true
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0 && index <= 3) { // Background cards within stack range
          const style = cardWrapper.attributes('style')
          if (!style?.match(/translate3D\(-\d+px,\s*0,\s*0\)/)) {
            allHaveLeftTransforms = false
          }
        }
      })

      expect(allHaveLeftTransforms).toBe(true)
    })
  })

  describe('stackDirection with stackOffset 0', () => {
    beforeEach(() => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: NO_STACK_OFFSET,
          stackDirection: StackDirection.RIGHT, // Direction shouldn't matter with 0 offset
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should not apply directional transforms when stackOffset is 0', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // All translate3D transforms should have 0 offset values
      let allHaveZeroOffsets = true
      cardWrappers.forEach((cardWrapper) => {
        const style = cardWrapper.attributes('style')
        const parsed = parseTranslate3D(style)
        if (parsed && (parsed.x !== 0 || parsed.y !== 0)) {
          allHaveZeroOffsets = false
        }
      })

      expect(allHaveZeroOffsets).toBe(true)
    })

    it('should still apply scale transforms regardless of direction', () => {
      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should still have scale transforms
      let hasScaleTransforms = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index > 0) { // Skip active card
          const style = cardWrapper.attributes('style')
          if (style?.match(/scale/)) {
            hasScaleTransforms = true
          }
        }
      })

      expect(hasScaleTransforms).toBe(true)
    })
  })

  describe('stackDirection combined with other stack props', () => {
    it('should work correctly with custom stackScale and stackOffset', () => {
      wrapper = mount(FlashCards, {
        props: {
          items: testItems,
          stack: 2,
          stackOffset: STACK_OFFSET_FOR_SCALE_TEST,
          stackScale: AGGRESSIVE_SCALE_FACTOR,
          stackDirection: StackDirection.TOP,
        },
        slots: {
          default: '{{ item.title }}',
        },
        global: { stubs: { Transition: false } },
      })

      const cardWrappers = wrapper.findAll('.flashcards__card-wrapper:not(.flashcards-empty-state)')

      // Should have both TOP direction transform and custom scale
      let foundCombinedTransform = false
      cardWrappers.forEach((cardWrapper, index) => {
        if (index === 1) { // First background card
          const style = cardWrapper.attributes('style')
          // Should have translate3D with -25px Y and scale(0.9)
          if (style?.match(/translate3D\(0,\s*-25px,\s*0\).*scale\(0\.9\)/)
            || style?.match(/scale\(0\.9\).*translate3D\(0,\s*-25px,\s*0\)/)) {
            foundCombinedTransform = true
          }
        }
      })

      expect(foundCombinedTransform).toBe(true)
    })
  })
})
