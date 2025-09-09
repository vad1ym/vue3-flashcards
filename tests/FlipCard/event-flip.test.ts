import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('[event] flip', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlipCard>>

  const createWrapper = (props = {}, provide = {}) => {
    return mount(FlipCard, {
      props,
      slots: {
        front: '<div class="front-content">Front Side</div>',
        back: '<div class="back-content">Back Side</div>',
      },
      global: {
        provide: {
          [IsDraggingStateInjectionKey as symbol]: ref(false),
          ...provide,
        },
      },
    })
  }

  describe('basic functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should emit flip event with true when flipped by click', async () => {
      const cardElement = wrapper.find('.flip-card')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.emitted('flip')).toBeTruthy()
      expect(wrapper.emitted('flip')![0]).toEqual([true])
    })

    it('should emit flip event with false when flipped back', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.emitted('flip')![0]).toEqual([true])

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.emitted('flip')![1]).toEqual([false])
    })

    it('should emit flip event with correct value when using exposed method', async () => {
      // First flip via exposed method
      wrapper.vm.flip()
      await nextTick()

      expect(wrapper.emitted('flip')).toBeTruthy()
      expect(wrapper.emitted('flip')![0]).toEqual([true])

      // End animation
      const inner = wrapper.find('.flip-card__inner')
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip via exposed method
      wrapper.vm.flip()
      await nextTick()
      expect(wrapper.emitted('flip')![1]).toEqual([false])
    })

    it('should emit multiple flip events correctly', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Flip sequence: false -> true -> false -> true
      for (let i = 0; i < 3; i++) {
        await cardElement.trigger('pointerup')
        await nextTick()

        const expectedValue = i % 2 === 0 // true for even indices (0, 2), false for odd (1)
        expect(wrapper.emitted('flip')![i]).toEqual([expectedValue])

        // End animation to allow next flip
        await inner.trigger('transitionend')
        await nextTick()
      }

      expect(wrapper.emitted('flip')!.length).toBe(3)
    })
  })

  describe('with disabled prop', () => {
    beforeEach(() => {
      wrapper = createWrapper({ disabled: true })
    })

    it('should not emit flip event when disabled', async () => {
      const cardElement = wrapper.find('.flip-card')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.emitted('flip')).toBeFalsy()
    })

    it('should not emit flip event when using exposed method while disabled', async () => {
      wrapper.vm.flip()
      await nextTick()

      expect(wrapper.emitted('flip')).toBeFalsy()
    })
  })

  describe('with waitAnimationEnd prop', () => {
    beforeEach(() => {
      wrapper = createWrapper({ waitAnimationEnd: true })
    })

    it('should not emit second flip event during animation', async () => {
      const cardElement = wrapper.find('.flip-card')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.emitted('flip')![0]).toEqual([true])

      // Try to flip again during animation - should not emit
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.emitted('flip')!.length).toBe(1)
    })

    it('should emit flip event after animation ends', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.emitted('flip')![0]).toEqual([true])

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip should now work
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.emitted('flip')![1]).toEqual([false])
    })
  })

  describe('with dragging state', () => {
    it('should not emit flip event when dragging', async () => {
      const isDragging = ref(true)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const cardElement = wrapper.find('.flip-card')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.emitted('flip')).toBeFalsy()
    })

    it('should emit flip event when not dragging', async () => {
      const isDragging = ref(false)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const cardElement = wrapper.find('.flip-card')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.emitted('flip')).toBeTruthy()
      expect(wrapper.emitted('flip')![0]).toEqual([true])
    })
  })
})
