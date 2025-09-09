import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for max dragging Y functionality
const MAX_DRAGGING_Y_LIMIT = 50 // Maximum vertical pixels allowed for dragging
const DRAG_DISTANCE_WITHIN_Y_LIMIT = 40 // Drag distance that should be allowed (within limit)
const DRAG_DISTANCE_EXCEEDING_Y_LIMIT = 80 // Drag distance that exceeds the limit and should be clamped
const HORIZONTAL_DRAG_DISTANCE = 100 // Horizontal drag distance for combined movement tests
const UNLIMITED_Y_DRAG_DISTANCE = 200 // Large drag distance for testing unlimited vertical dragging

describe('[props] maxDraggingY', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with maxDraggingY set to limit', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingY: MAX_DRAGGING_Y_LIMIT,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow dragging up to maxDraggingY limit', async () => {
      // Drag down within limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: DRAG_DISTANCE_WITHIN_Y_LIMIT }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(0px, ${DRAG_DISTANCE_WITHIN_Y_LIMIT}px, 0)`)
    })

    it('should clamp vertical dragging when exceeding positive maxDraggingY', async () => {
      // Try to drag down beyond limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: DRAG_DISTANCE_EXCEEDING_Y_LIMIT }])

      await wrapper.vm.$nextTick()

      // Should be clamped to limit
      expect(cardElement.style.transform).toContain(`translate3D(0px, ${MAX_DRAGGING_Y_LIMIT}px, 0)`)
    })

    it('should clamp vertical dragging when exceeding negative maxDraggingY', async () => {
      // Try to drag up beyond negative limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: -DRAG_DISTANCE_EXCEEDING_Y_LIMIT }])

      await wrapper.vm.$nextTick()

      // Should be clamped to negative limit
      expect(cardElement.style.transform).toContain(`translate3D(0px, -${MAX_DRAGGING_Y_LIMIT}px, 0)`)
    })

    it('should still allow horizontal dragging when vertical is clamped', async () => {
      // Drag horizontally and vertically beyond limit (vertical should be clamped)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: HORIZONTAL_DRAG_DISTANCE, y: DRAG_DISTANCE_EXCEEDING_Y_LIMIT }])

      await wrapper.vm.$nextTick()

      // Horizontal should be full, vertical should be clamped
      expect(cardElement.style.transform).toContain(`translate3D(${HORIZONTAL_DRAG_DISTANCE}px, ${MAX_DRAGGING_Y_LIMIT}px, 0)`)
    })

    it('should work correctly during swipe completion', async () => {
      // Drag beyond threshold horizontally and vertically beyond limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: config.defaultThreshold + 10, y: DRAG_DISTANCE_EXCEEDING_Y_LIMIT }]) // Exceed both threshold and Y limit
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should complete the swipe and emit event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0]).toEqual([true])
    })
  })

  describe('with maxDraggingY disabled (null)', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingY: null, // Explicitly disable Y limit
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow unlimited vertical dragging when maxDraggingY is null', async () => {
      // Drag down with no limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: UNLIMITED_Y_DRAG_DISTANCE }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(0px, ${UNLIMITED_Y_DRAG_DISTANCE}px, 0)`)
    })

    it('should allow unlimited upward dragging when maxDraggingY is null', async () => {
      // Drag up with no limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: -UNLIMITED_Y_DRAG_DISTANCE }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain(`translate3D(0px, -${UNLIMITED_Y_DRAG_DISTANCE}px, 0)`)
    })
  })
})
