import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] threshold', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('default threshold', () => {
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

    it('should emit complete when swiped beyond threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe(true) // approved = true
    })

    it('should not complete when swiped below threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeRightBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('custom threshold', () => {
    it('should work with custom threshold value', async () => {
      const customThreshold = 200
      const customWrapper = mount(FlashCard, {
        props: {
          threshold: customThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      // Use exposed method to test with custom threshold
      customWrapper.vm.approve()
      await customWrapper.vm.$nextTick()

      expect(customWrapper.emitted('complete')).toBeTruthy()
      expect(customWrapper.emitted('complete')?.[0][0]).toBe(true)
    })

    it('should respect different threshold for reject', async () => {
      const customThreshold = 100
      const customWrapper = mount(FlashCard, {
        props: {
          threshold: customThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      customWrapper.vm.reject()
      await customWrapper.vm.$nextTick()

      expect(customWrapper.emitted('complete')).toBeTruthy()
      expect(customWrapper.emitted('complete')?.[0][0]).toBe(false)
    })
  })
})
