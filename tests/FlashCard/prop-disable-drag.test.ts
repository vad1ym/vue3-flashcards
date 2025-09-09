import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for disable drag functionality

describe('[props] disableDrag', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with disableDrag: true', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: true,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should not respond to drag gestures when dragging is disabled', async () => {
      // Try to drag the card beyond threshold
      new DragSimulator(cardElement).swipeApprove()

      await wrapper.vm.$nextTick()

      // Should not be dragging
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should not trigger complete event when dragging is disabled', async () => {
      // Try to swipe beyond threshold
      new DragSimulator(cardElement).swipeApprove()

      await wrapper.vm.$nextTick()

      // Should not have emitted complete event
      expect(wrapper.emitted('complete')).toBeFalsy()
    })

    it('should not show drag indicators when dragging is disabled', async () => {
      // Try to drag the card but not complete (to test indicators)
      new DragSimulator(cardElement).dragRightBelowThreshold() // 90% of threshold, without dragEnd

      await wrapper.vm.$nextTick()

      // Should not show approve/reject indicators (they exist but should not be visible)
      const approveDiv = wrapper.find('[v-show="position.type === \'approve\'"]')
      const rejectDiv = wrapper.find('[v-show="position.type === \'reject\'"]')

      // Since dragging is disabled, position.type should be null, so indicators should not be visible
      if (approveDiv.exists()) {
        expect(approveDiv.isVisible()).toBe(false)
      }
      if (rejectDiv.exists()) {
        expect(rejectDiv.isVisible()).toBe(false)
      }
    })

    it('should apply drag-disabled class when disableDrag is true', () => {
      // Should have drag-disabled class
      expect(cardElement.classList.contains('flash-card--drag-disabled')).toBe(true)
    })
  })

  describe('with disableDrag: false', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: false,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should respond to drag gestures when dragging is enabled', async () => {
      // Try to drag the card but not complete (to test dragging state)
      new DragSimulator(cardElement).dragRightBelowThreshold() // 90% of threshold, without dragEnd

      await wrapper.vm.$nextTick()

      // Should be dragging
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should not apply drag-disabled class when disableDrag is false', () => {
      // Should not have drag-disabled class
      expect(cardElement.classList.contains('flash-card--drag-disabled')).toBe(false)
    })
  })

  describe('dynamic disableDrag changes', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: false,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should stop responding to drag when disableDrag is changed to true', async () => {
      // Initially should respond to small drag (33% of threshold)
      new DragSimulator(cardElement).dragRightToThreshold(0.33)

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)

      // End the drag first, then change disableDrag to true
      new DragSimulator(cardElement).dragEnd()
      await wrapper.vm.$nextTick()
      await wrapper.setProps({ disableDrag: true })

      // Now should not respond to drag but not complete
      new DragSimulator(cardElement).dragRightBelowThreshold()

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should start responding to drag when disableDrag is changed to false', async () => {
      // Change to disabled first
      await wrapper.setProps({ disableDrag: true })

      // Should not respond to drag but not complete
      new DragSimulator(cardElement).dragRightBelowThreshold() // 90% of threshold, without dragEnd

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)

      // End the drag and enable dragging
      new DragSimulator(cardElement).dragEnd()
      await wrapper.vm.$nextTick()
      await wrapper.setProps({ disableDrag: false })

      // Now should respond to drag but not complete
      new DragSimulator(cardElement).dragRightBelowThreshold() // 90% of threshold, without dragEnd

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should update drag-disabled CSS class when disableDrag changes', async () => {
      // Initially should not have drag-disabled class (drag enabled)
      expect(cardElement.classList.contains('flash-card--drag-disabled')).toBe(false)

      // Change to disabled - should have drag-disabled class
      await wrapper.setProps({ disableDrag: true })
      expect(cardElement.classList.contains('flash-card--drag-disabled')).toBe(true)

      // Change back to enabled - should not have drag-disabled class
      await wrapper.setProps({ disableDrag: false })
      expect(cardElement.classList.contains('flash-card--drag-disabled')).toBe(false)
    })
  })
})
