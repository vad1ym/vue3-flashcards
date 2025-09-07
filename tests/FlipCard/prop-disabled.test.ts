import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('[props] disabled', () => {
  let wrapper: any

  const createWrapper = (disabled: boolean) => {
    return mount(FlipCard, {
      props: { disabled },
      slots: {
        front: '<div class="front-content">Front Side</div>',
        back: '<div class="back-content">Back Side</div>',
      },
      global: {
        provide: {
          [IsDraggingStateInjectionKey as symbol]: ref(false),
        },
      },
    })
  }

  describe('when disabled is true', () => {
    beforeEach(() => {
      wrapper = createWrapper(true)
    })

    it('should not flip when card is clicked', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
    })

    it('should remain in initial state after multiple clicks', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await cardElement.trigger('pointerup')
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
      expect(wrapper.vm.isAnimating).toBe(false)
    })
  })

  describe('when disabled is false', () => {
    beforeEach(() => {
      wrapper = createWrapper(false)
    })

    it('should flip when card is clicked', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)
    })

    it('should toggle between flipped states', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)

      // End animation to allow second flip
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip (back to front)
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
    })
  })

  describe('default behavior', () => {
    beforeEach(() => {
      wrapper = mount(FlipCard, {
        slots: {
          front: '<div>Front</div>',
          back: '<div>Back</div>',
        },
        global: {
          provide: {
            [IsDraggingStateInjectionKey as symbol]: ref(false),
          },
        },
      })
    })

    it('should default to disabled: false and allow flipping', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      expect(wrapper.props('disabled')).toBe(false)

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)
    })
  })
})
