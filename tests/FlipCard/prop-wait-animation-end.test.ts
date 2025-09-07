import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('[props] wait-animation-end', () => {
  let wrapper: any

  const createWrapper = (waitAnimationEnd: boolean) => {
    return mount(FlipCard, {
      props: { waitAnimationEnd },
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

  describe('when waitAnimationEnd is true', () => {
    beforeEach(() => {
      wrapper = createWrapper(true)
    })

    it('should not flip while animating', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Start first flip
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(true)
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // Try to flip again while animating - should be blocked
      await cardElement.trigger('pointerup')
      await nextTick()

      // Should still be flipped (no change)
      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)
    })

    it('should allow flipping after animation ends', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Start first flip
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(true)
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(false)

      // Should now be able to flip again
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
    })

    it('should handle multiple animation cycles correctly', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // First complete cycle
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(true)
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      await inner.trigger('transitionend')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(false)

      // Second complete cycle
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(true)
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      await inner.trigger('transitionend')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(false)
    })
  })

  describe('when waitAnimationEnd is false', () => {
    beforeEach(() => {
      wrapper = createWrapper(false)
    })

    it('should allow flipping while animating', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Start first flip
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(true)
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // Try to flip again while animating - should be allowed
      await cardElement.trigger('pointerup')
      await nextTick()

      // Should flip back to front
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
    })

    it('should allow rapid flipping without waiting', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Rapid succession of flips
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      await cardElement.trigger('pointerup')
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')
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

    it('should default to waitAnimationEnd: true', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      expect(wrapper.props('waitAnimationEnd')).toBe(true)

      // Start flip
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(true)

      // Try to flip again - should be blocked by default
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)
    })
  })
})
