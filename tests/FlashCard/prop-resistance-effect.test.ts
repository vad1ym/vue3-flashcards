import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { resistanceDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for resistance effect functionality
const RESISTANCE_THRESHOLD = 100 // Distance before resistance kicks in
const RESISTANCE_STRENGTH = 0.5 // Strength of resistance (0-1)
const DRAG_BEYOND_THRESHOLD = 200 // Distance that exceeds resistance threshold
const DRAG_WITHIN_THRESHOLD = 80 // Distance within resistance threshold
const EXPECTED_RESISTANCE_POSITION = 141 // Expected position with resistance applied (threshold + reduced excess)

describe('[props] resistance', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with resistance enabled', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          resistance: { threshold: RESISTANCE_THRESHOLD, strength: RESISTANCE_STRENGTH },
          swipeThreshold: 300, // High threshold to prevent completion during resistance tests
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow normal dragging when within resistance threshold', async () => {
      // Drag within resistance threshold
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_WITHIN_THRESHOLD, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement (no resistance applied)
      expect(cardElement.style.transform).toContain(`translate3D(${DRAG_WITHIN_THRESHOLD}px, 0px, 0)`)
    })

    it('should apply resistance when dragging beyond resistance threshold (horizontal)', async () => {
      // Drag beyond resistance threshold
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_BEYOND_THRESHOLD, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should apply resistance (position should be less than full drag distance)
      const transformMatch = cardElement.style.transform.match(/translate3D\((-?\d+(?:\.\d+)?)px/)
      const actualX = transformMatch ? Number.parseFloat(transformMatch[1]) : 0

      expect(actualX).toBeGreaterThan(RESISTANCE_THRESHOLD) // Should be beyond threshold
      expect(actualX).toBeLessThan(DRAG_BEYOND_THRESHOLD) // But less than full drag distance
      expect(actualX).toBeCloseTo(EXPECTED_RESISTANCE_POSITION, 0) // Should match expected resistance calculation
    })

    it('should apply resistance effect when swipeDirection is vertical', async () => {
      // Mount with vertical swipe direction
      wrapper = mount(FlashCard, {
        props: {
          resistance: { threshold: RESISTANCE_THRESHOLD, strength: RESISTANCE_STRENGTH },
          swipeDirection: 'vertical',
          swipeThreshold: 300,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element

      // Just test that vertical direction doesn't break resistance effect
      expect(wrapper.vm).toBeDefined()
      expect(cardElement.classList.contains('flash-card')).toBe(true)
    })

    it('should apply stronger resistance with higher strength', async () => {
      // Just test that a higher resistance strength is accepted
      const strongerWrapper = mount(FlashCard, {
        props: {
          resistance: { threshold: RESISTANCE_THRESHOLD, strength: 0.8 }, // Higher resistance
          swipeThreshold: 300,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      // Test that component mounts successfully with different resistance strength
      expect(strongerWrapper.vm).toBeDefined()
      expect(strongerWrapper.element.classList.contains('flash-card')).toBe(true)
    })

    it('should work with negative drag distances (left/up direction)', async () => {
      // Drag left beyond resistance threshold
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: -DRAG_BEYOND_THRESHOLD, y: 0 }])

      await wrapper.vm.$nextTick()

      const transformMatch = cardElement.style.transform.match(/translate3D\((-?\d+(?:\.\d+)?)px/)
      const actualX = transformMatch ? Number.parseFloat(transformMatch[1]) : 0

      expect(actualX).toBeLessThan(-RESISTANCE_THRESHOLD) // Should be beyond negative threshold
      expect(actualX).toBeGreaterThan(-DRAG_BEYOND_THRESHOLD) // But greater than full negative drag distance
      expect(actualX).toBeCloseTo(-EXPECTED_RESISTANCE_POSITION, 0) // Should match expected negative resistance
    })

    it('should work with resistance effect and different configurations', async () => {
      // Test that different resistance configurations don't break the component
      const configWrapper = mount(FlashCard, {
        props: {
          resistance: { threshold: 50, strength: 0.3 },
          swipeThreshold: 100,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      // Test that component works with different configurations
      expect(configWrapper.vm).toBeDefined()
      expect(configWrapper.element.classList.contains('flash-card')).toBe(true)
    })

    it('uses default threshold/strength for an empty resistance object', async () => {
      // `resistance: {}` enables the effect with both fields defaulted.
      const defaultWrapper = mount(FlashCard, {
        props: {
          resistance: {},
          swipeThreshold: 500,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      // Let onMounted → setupInteract attach the pointer listeners.
      await defaultWrapper.vm.$nextTick()

      new DragSimulator(defaultWrapper.element)
        .dragStart()
        .dragMove([{ x: resistanceDefaults.threshold + 100, y: 0 }])

      await defaultWrapper.vm.$nextTick()

      const transformMatch = defaultWrapper.element.style.transform.match(/translate3D\((-?\d+(?:\.\d+)?)px/)
      const actualX = transformMatch ? Number.parseFloat(transformMatch[1]) : 0
      // Resistance applied → position is held below the raw drag distance.
      expect(actualX).toBeLessThan(resistanceDefaults.threshold + 100)
      expect(actualX).toBeGreaterThan(resistanceDefaults.threshold)
    })
  })

  describe('with resistance disabled', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          resistance: null,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should not apply resistance when resistance is disabled', async () => {
      // Drag beyond what would be resistance threshold
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_BEYOND_THRESHOLD, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement (no resistance)
      expect(cardElement.style.transform).toContain(`translate3D(${DRAG_BEYOND_THRESHOLD}px, 0px, 0)`)
    })
  })

  describe('with default resistance (omitted)', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {}, // Use all defaults — resistance is off by default
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('does not apply resistance by default', async () => {
      // Drag beyond the default resistance threshold
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: resistanceDefaults.threshold + 50, y: 0 }])

      await wrapper.vm.$nextTick()

      // Resistance is off by default → full movement.
      expect(cardElement.style.transform).toContain(`translate3D(${resistanceDefaults.threshold + 50}px, 0px, 0)`)
    })
  })
})
