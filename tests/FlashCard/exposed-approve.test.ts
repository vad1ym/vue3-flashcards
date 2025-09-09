import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'

const CUSTOM_THRESHOLD_FOR_TESTING = 200

describe('[exposed] approve', () => {
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

    it('should trigger approve animation when approve method is called', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should move card to approved position (at threshold)
      expect(cardElement.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)
    })

    it('should emit complete event with true when approve method is called', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should emit complete event with approved = true
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([true])
    })

    it('should set drag position type to APPROVE', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should show approve indicator
      const approveIndicator = wrapper.find('.flash-card__indicator')
      expect(approveIndicator.exists()).toBe(true)
    })

    it('should set correct delta value for approve', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // The approve method should set delta to 1 (full approval)
      const approveSlot = wrapper.find('.flash-card__indicator')
      if (approveSlot.exists()) {
        expect(approveSlot.attributes('style')).toContain('opacity: 1')
      }
    })
  })

  describe('multiple calls', () => {
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

    it('should handle multiple approve calls without issues', async () => {
      // Call approve multiple times
      wrapper.vm.approve()
      wrapper.vm.approve()
      wrapper.vm.approve()

      await wrapper.vm.$nextTick()

      // Should only emit complete event once per call
      expect(wrapper.emitted('complete')?.length).toBe(3)
      expect(wrapper.emitted('complete')![2]).toEqual([true])
    })
  })

  describe('with custom threshold', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          threshold: CUSTOM_THRESHOLD_FOR_TESTING, // Custom threshold
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use custom threshold for approve animation', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should move card to custom threshold
      expect(wrapper.element.style.transform).toContain(`translate3D(${CUSTOM_THRESHOLD_FOR_TESTING}px, 0px, 0)`)
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
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should still trigger approve animation
      expect(wrapper.element.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      // Should still emit complete event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([true])
    })

    it('should show approve indicator even when dragging is disabled', async () => {
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should show approve indicator
      const approveIndicator = wrapper.find('.flash-card__indicator')
      expect(approveIndicator.exists()).toBe(true)
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
      // Call the exposed approve method
      wrapper.vm.approve()
      await wrapper.vm.$nextTick()

      // Should trigger approve animation
      expect(wrapper.element.style.transform).toContain(`translate3D(${config.defaultThreshold}px, 0px, 0)`)

      // Should emit complete event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')![0]).toEqual([true])
    })
  })
})
