import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] maxDraggingX', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with maxDraggingX set to 100px', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingX: 100, // Limit horizontal dragging to 100px
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow dragging up to maxDraggingX limit', async () => {
      // Drag right 80px (within 100px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 80, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(80px, 0px, 0)')
    })

    it('should clamp horizontal dragging when exceeding positive maxDraggingX', async () => {
      // Try to drag right 150px (exceeds 100px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 150, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to 100px
      expect(cardElement.style.transform).toContain('translate3D(100px, 0px, 0)')
    })

    it('should clamp horizontal dragging when exceeding negative maxDraggingX', async () => {
      // Try to drag left -150px (exceeds -100px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: -150, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to -100px
      expect(cardElement.style.transform).toContain('translate3D(-100px, 0px, 0)')
    })

    it('should still allow vertical dragging when horizontal is clamped', async () => {
      // Drag horizontally 150px (should be clamped) and vertically 50px
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 150, y: 50 }])

      await wrapper.vm.$nextTick()

      // Horizontal should be clamped, vertical should be full
      expect(cardElement.style.transform).toContain('translate3D(100px, 50px, 0)')
    })

    it('should affect swipe completion when threshold exceeds maxDraggingX', async () => {
      // Set threshold higher than maxDraggingX
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingX: 100,
          threshold: 200, // Higher than maxDraggingX
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
        .dragMove([{ x: 250, y: 0 }]) // Try to drag 250px
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should NOT complete because actual movement was clamped to 100px (less than 200px threshold)
      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)') // Should restore
    })

    it('should clamp position even during completion logic', async () => {
      // This test verifies that maxDraggingX affects the completion by checking the final position
      // The card should be clamped to maxDraggingX even if user tries to drag beyond it
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 150, y: 0 }]) // Try to drag 150px (more than 100px limit)
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Since 100px (clamped) < 150px (threshold), it should restore to origin
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
      // Drag right 300px (no limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 300, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(300px, 0px, 0)')
    })

    it('should allow unlimited leftward dragging when maxDraggingX is null', async () => {
      // Drag left -300px (no limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: -300, y: 0 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(-300px, 0px, 0)')
    })
  })
})
