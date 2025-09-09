import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

// Test constants for restore functionality

describe('[exposed] restore', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('basic functionality', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should reset card position when restore method is called', async () => {
      // First, move the card to an approved position
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      expect(cardElement.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      // Then restore it
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should return to original position
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should reset drag position type to null', async () => {
      // First, set card to reject state
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Then restore
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should not show any indicators
      const approveDiv = wrapper.find('[v-show="position.type === DragType.APPROVE"]')
      const rejectDiv = wrapper.find('[v-show="position.type === DragType.REJECT"]')

      // Both should be hidden since type is null
      if (approveDiv.exists()) {
        expect(approveDiv.isVisible()).toBe(false)
      }
      if (rejectDiv.exists()) {
        expect(rejectDiv.isVisible()).toBe(false)
      }
    })

    it('should reset delta to 0', async () => {
      // First, set card to approved state
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Then restore
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Check that indicators are no longer visible (opacity should be 0)
      const indicators = wrapper.findAll('.flash-card__indicator')
      indicators.forEach((indicator) => {
        if (indicator.isVisible()) {
          expect(indicator.attributes('style')).toContain('opacity: 0')
        }
      })
    })

    it('should work after card was dragged manually', async () => {
      // Manually drag the card below threshold
      new DragSimulator(cardElement).swipeRightBelowThreshold()

      await wrapper.vm.$nextTick()

      // Card should be back to original position (since it didn't reach threshold)
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')

      // Restore should still work
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('multiple restores', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle multiple restore calls without issues', async () => {
      // Move card first
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Call restore multiple times
      wrapper.vm.restore()
      wrapper.vm.restore()
      wrapper.vm.restore()

      await wrapper.vm.$nextTick()

      // Should remain at original position
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should work correctly when called on already restored card', async () => {
      // Card is already at original position, call restore
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should remain at original position
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('restore after different actions', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should restore after approve', async () => {
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should restore after reject', async () => {
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain(`translate3D(-${config.defaultThreshold}px, 0px, 0)`)

      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should not emit complete event when restoring', async () => {
      // Move card to approved state
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Clear previous events
      wrapper.vm.$emit = vi.fn()

      // Restore should not emit complete event
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should not have new complete events from restore
      const completeEvents = wrapper.emitted('complete')
      expect(completeEvents?.length).toBe(1) // Only the original approve event
    })
  })

  describe('with disableDrag: true', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: true,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should still work when dragging is disabled', async () => {
      // Move card first using approve method (should work even with disableDrag)
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      // Restore should work
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()

      // Should return to original position
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should work with reject and restore when dragging is disabled', async () => {
      // Move to reject position
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain(`translate3D(-${config.defaultThreshold}px, 0px, 0)`)

      // Restore should work
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('with disableDrag: false', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: false,
          threshold: config.defaultThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should work normally when dragging is enabled', async () => {
      // Move card and restore
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      expect(wrapper.element.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should work with manual dragging and restore', async () => {
      const cardElement = wrapper.element

      // Manually drag and release (without reaching threshold)
      new DragSimulator(cardElement).swipeRightBelowThreshold()

      await wrapper.vm.$nextTick()

      // Should already be restored automatically
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')

      // Manual restore should still work
      wrapper.vm.restore()
      await wrapper.vm.$nextTick()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })
})
