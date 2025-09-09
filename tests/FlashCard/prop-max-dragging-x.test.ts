import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for max dragging X functionality
const MAX_DRAGGING_X_LIMIT = 100 // Maximum horizontal pixels allowed for dragging
const DRAG_DISTANCE_WITHIN_LIMIT = 80 // Drag distance that should be allowed (within limit)
const DRAG_DISTANCE_EXCEEDING_LIMIT = 150 // Drag distance that exceeds the limit and should be clamped
const VERTICAL_DRAG_DISTANCE = 50 // Vertical drag distance for combined movement tests
const HIGH_THRESHOLD_FOR_TESTING = 200 // Threshold higher than max dragging limit for completion tests
const DRAG_DISTANCE_BEYOND_THRESHOLD = 250 // Drag distance that exceeds both limit and threshold
const UNLIMITED_DRAG_DISTANCE = 300 // Large drag distance for testing unlimited dragging

describe('[props] maxDraggingX', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with maxDraggingX set to limit', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingX: MAX_DRAGGING_X_LIMIT,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow dragging up to maxDraggingX limit', async () => {
      // Drag right within limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_DISTANCE_WITHIN_LIMIT, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(${DRAG_DISTANCE_WITHIN_LIMIT}px, 0px, 0)`)
    })

    it('should clamp horizontal dragging when exceeding positive maxDraggingX', async () => {
      // Try to drag right beyond limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_DISTANCE_EXCEEDING_LIMIT, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to limit
      expect(cardElement.style.transform).toContain(`translate3D(${MAX_DRAGGING_X_LIMIT}px, 0px, 0)`)
    })

    it('should clamp horizontal dragging when exceeding negative maxDraggingX', async () => {
      // Try to drag left beyond negative limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: -DRAG_DISTANCE_EXCEEDING_LIMIT, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to negative limit
      expect(cardElement.style.transform).toContain(`translate3D(-${MAX_DRAGGING_X_LIMIT}px, 0px, 0)`)
    })

    it('should still allow vertical dragging when horizontal is clamped', async () => {
      // Drag horizontally beyond limit (should be clamped) and vertically
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_DISTANCE_EXCEEDING_LIMIT, y: VERTICAL_DRAG_DISTANCE }])

      await wrapper.vm.$nextTick()

      // Horizontal should be clamped, vertical should be full
      expect(cardElement.style.transform).toContain(`translate3D(${MAX_DRAGGING_X_LIMIT}px, ${VERTICAL_DRAG_DISTANCE}px, 0)`)
    })

    it('should affect swipe completion when threshold exceeds maxDraggingX', async () => {
      // Set threshold higher than maxDraggingX
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingX: MAX_DRAGGING_X_LIMIT,
          threshold: HIGH_THRESHOLD_FOR_TESTING, // Higher than maxDraggingX
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element

      // Try to drag beyond threshold but it will be clamped
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_DISTANCE_BEYOND_THRESHOLD, y: 0 }]) // Try to drag beyond threshold
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should NOT complete because actual movement was clamped (less than threshold)
      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)') // Should restore
    })

    it('should clamp position even during completion logic', async () => {
      // This test verifies that maxDraggingX affects the completion by checking the final position
      // The card should be clamped to maxDraggingX even if user tries to drag beyond it
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DRAG_DISTANCE_EXCEEDING_LIMIT, y: 0 }]) // Try to drag beyond limit
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Since clamped distance < threshold, it should restore to origin
      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('with maxDraggingX disabled (null)', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingX: null, // Explicitly disable X limit
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow unlimited horizontal dragging when maxDraggingX is null', async () => {
      // Drag right with no limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: UNLIMITED_DRAG_DISTANCE, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(${UNLIMITED_DRAG_DISTANCE}px, 0px, 0)`)
    })

    it('should allow unlimited leftward dragging when maxDraggingX is null', async () => {
      // Drag left with no limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: -UNLIMITED_DRAG_DISTANCE, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(-${UNLIMITED_DRAG_DISTANCE}px, 0px, 0)`)
    })
  })
})
