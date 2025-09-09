import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('[exposed] flip', () => {
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

    it('should expose flip method', () => {
      expect(wrapper.vm.flip).toBeDefined()
      expect(typeof wrapper.vm.flip).toBe('function')
    })

    it('should flip the card when flip method is called', async () => {
      const inner = wrapper.find('.flip-card__inner')

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      // Call the exposed flip method
      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should flip back when flip method is called again', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation to allow second flip
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip (back to front)
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
    })

    it('should set animation state when flip method is called', async () => {
      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      // Test that animation is properly triggered by checking if second flip is blocked
      wrapper.vm.flip() // Try to flip again immediately
      await nextTick()

      // Should still be in flipped state (second flip blocked due to animation)
      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should work independently of pointer events', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // Use exposed method instead of clicking
      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })

  describe('multiple calls', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should handle multiple flip calls correctly', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Second flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Third flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })

  describe('with disabled prop', () => {
    beforeEach(() => {
      wrapper = createWrapper({ disabled: true })
    })

    it('should not flip when disabled', async () => {
      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
    })
  })

  describe('with waitAnimationEnd prop', () => {
    beforeEach(() => {
      wrapper = createWrapper({ waitAnimationEnd: true })
    })

    it('should not flip during animation when waitAnimationEnd is true', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // Try to flip again during animation (should be blocked)
      wrapper.vm.flip()
      await nextTick()

      // Should remain flipped and not flip back
      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should allow flip after animation ends', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // First flip
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).toContain('flip-card__inner--flipped')

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Now should be able to flip again
      wrapper.vm.flip()
      await nextTick()
      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
    })
  })

  describe('with dragging state', () => {
    it('should not flip when dragging', async () => {
      const isDragging = ref(true)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
    })

    it('should flip when not dragging', async () => {
      const isDragging = ref(false)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })

  describe('with different flip axis', () => {
    it('should work with flipAxis x', async () => {
      wrapper = createWrapper({ flipAxis: 'x' })
      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--x')
      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should work with flipAxis y', async () => {
      wrapper = createWrapper({ flipAxis: 'y' })
      const inner = wrapper.find('.flip-card__inner')

      wrapper.vm.flip()
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--y')
      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })
})
