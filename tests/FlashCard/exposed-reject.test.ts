import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'

describe('[exposed] reject', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('basic functionality', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: 150,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should trigger reject animation when reject method is called', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should move card to rejected position (beyond negative threshold)
      expect(cardElement.style.transform).toContain('translate3D(-151px, 0px, 0)')
    })

    it('should emit complete event with false when reject method is called', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should emit complete event with approved = false
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([false])
    })

    it('should set drag position type to REJECT', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should show reject indicator
      const rejectIndicator = wrapper.find('.flash-card__indicator')
      expect(rejectIndicator.exists()).toBe(true)
    })

    it('should set correct delta value for reject', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // The reject method should set delta to -1 (full rejection)
      const rejectSlot = wrapper.find('.flash-card__indicator')
      if (rejectSlot.exists()) {
        expect(rejectSlot.attributes('style')).toContain('opacity: 1')
      }
    })
  })

  describe('multiple calls', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: 150,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should handle multiple reject calls without issues', async () => {
      // Call reject multiple times
      wrapper.vm.reject()
      wrapper.vm.reject()
      wrapper.vm.reject()

      await wrapper.vm.$nextTick()

      // Should only emit complete event once per call
      expect(wrapper.emitted('complete')?.length).toBe(3)
      expect(wrapper.emitted('complete')![2]).toEqual([false])
    })
  })

  describe('with custom threshold', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: 200, // Custom threshold
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom threshold for reject animation', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should move card beyond custom negative threshold (-200 - 1 = -201px)
      expect(wrapper.element.style.transform).toContain('translate3D(-201px, 0px, 0)')
    })
  })

  describe('with disableDrag: true', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: true,
          threshold: 150,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should still work when dragging is disabled', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should still trigger reject animation
      expect(wrapper.element.style.transform).toContain('translate3D(-151px, 0px, 0)')

      // Should still emit complete event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([false])
    })

    it('should show reject indicator even when dragging is disabled', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should show reject indicator
      const rejectIndicator = wrapper.find('.flash-card__indicator')
      expect(rejectIndicator.exists()).toBe(true)
    })
  })

  describe('with disableDrag: false', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          disableDrag: false,
          threshold: 150,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should work normally when dragging is enabled', async () => {
      // Call the exposed reject method
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should trigger reject animation
      expect(wrapper.element.style.transform).toContain('translate3D(-151px, 0px, 0)')

      // Should emit complete event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([false])
    })
  })

  describe('interaction with approve method', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: 150,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should override approve animation when called after approve', async () => {
      // Call approve first
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Then call reject
      wrapper.vm.reject()
      await wrapper.vm.$nextTick()

      // Should show reject animation (overrides previous approve)
      expect(wrapper.element.style.transform).toContain('translate3D(-151px, 0px, 0)')

      // Should have emitted both events
      expect(wrapper.emitted('complete')?.length).toBe(2)
      expect(wrapper.emitted('complete')![0]).toEqual([true]) // approve
      expect(wrapper.emitted('complete')![1]).toEqual([false]) // reject
    })
  })
})
