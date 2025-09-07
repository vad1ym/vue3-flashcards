import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('[props] flipAxis', () => {
  let wrapper: any

  const createWrapper = (flipAxis: 'x' | 'y') => {
    return mount(FlipCard, {
      props: { flipAxis },
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

  describe('when flipAxis is "y" (default)', () => {
    beforeEach(() => {
      wrapper = createWrapper('y')
    })

    it('should apply correct CSS class for Y-axis flip when flipped', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Initially not flipped
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      // Click to flip
      await cardElement.trigger('pointerup')
      await nextTick()

      // Should have flipped class and Y axis class
      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(inner.classes()).toContain('flip-card__inner--y')
    })

    it('should toggle Y-axis flip class correctly', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation to allow second flip
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip (back to front)
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
    })
  })

  describe('when flipAxis is "x"', () => {
    beforeEach(() => {
      wrapper = createWrapper('x')
    })

    it('should apply correct CSS class for X-axis flip when flipped', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Initially not flipped
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      // Click to flip
      await cardElement.trigger('pointerup')
      await nextTick()

      // Should have flipped class and X axis class
      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(inner.classes()).toContain('flip-card__inner--x')
    })

    it('should toggle X-axis flip class correctly', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation to allow second flip
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip (back to front)
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
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

    it('should default to Y-axis flip when no flipAxis prop is provided', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(inner.classes()).toContain('flip-card__inner--y')
    })
  })

  describe('flipAxis prop changes', () => {
    it('should update flip behavior when flipAxis prop changes', async () => {
      wrapper = createWrapper('y')
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Initial flip with Y axis
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // Change prop to X axis
      await wrapper.setProps({ flipAxis: 'x' })
      await nextTick()

      // Should still be flipped but with X axis class now
      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(inner.classes()).toContain('flip-card__inner--x')
      expect(inner.classes()).not.toContain('flip-card__inner--y')
    })
  })
})
