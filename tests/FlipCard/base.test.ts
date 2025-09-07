import type { DOMWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import FlipCard from '../../src/FlipCard.vue'
import { IsDraggingStateInjectionKey } from '../../src/utils/useDragSetup'

describe('flipCard base functionality', () => {
  let wrapper: any

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

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('rendering', () => {
    it('should render the flip card with front and back slots', () => {
      expect(wrapper.find('.flip-card').exists()).toBe(true)
      expect(wrapper.find('.flip-card__inner').exists()).toBe(true)
      expect(wrapper.find('.flip-card__front').exists()).toBe(true)
      expect(wrapper.find('.flip-card__back').exists()).toBe(true)
      expect(wrapper.find('.front-content').text()).toBe('Front Side')
      expect(wrapper.find('.back-content').text()).toBe('Back Side')
    })

    it('should render without back slot', () => {
      const wrapperWithoutBack = mount(FlipCard, {
        slots: {
          front: '<div class="front-only">Front Only</div>',
        },
        global: {
          provide: {
            [IsDraggingStateInjectionKey as symbol]: ref(false),
          },
        },
      })

      expect(wrapperWithoutBack.find('.front-only').text()).toBe('Front Only')
      expect(wrapperWithoutBack.find('.flip-card__back').exists()).toBe(true)
    })

    it('should apply correct base CSS classes', () => {
      expect(wrapper.find('.flip-card').exists()).toBe(true)
      expect(wrapper.find('.flip-card__inner').exists()).toBe(true)
      expect(wrapper.find('.flip-card__front').exists()).toBe(true)
      expect(wrapper.find('.flip-card__back').exists()).toBe(true)
    })
  })

  describe('flipping functionality', () => {
    let cardElement: DOMWrapper<HTMLElement>

    beforeEach(() => {
      cardElement = wrapper.find('.flip-card')
    })

    it('should flip the card when clicked', async () => {
      const inner = wrapper.find('.flip-card__inner')

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should flip back when clicked again', async () => {
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

    it('should handle animation state correctly', async () => {
      const inner = wrapper.find('.flip-card__inner')

      // Start flip
      await cardElement.trigger('pointerup')
      await nextTick()

      // Should be animating
      expect(wrapper.vm.isAnimating).toBe(true)

      // End animation
      await inner.trigger('transitionend')
      await nextTick()

      // Should not be animating
      expect(wrapper.vm.isAnimating).toBe(false)
    })

    it('should toggle flipped class correctly', async () => {
      const inner = wrapper.find('.flip-card__inner')

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })

  describe('dragging state integration', () => {
    it('should not flip when dragging', async () => {
      const isDragging = ref(true)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(false)
    })

    it('should flip when not dragging', async () => {
      const isDragging = ref(false)
      wrapper = createWrapper({}, { [IsDraggingStateInjectionKey as symbol]: isDragging })

      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
      expect(wrapper.vm.isFlipped).toBe(true)
    })

    it('should work without dragging state injection', async () => {
      const wrapperWithoutDrag = mount(FlipCard, {
        slots: {
          front: '<div>Front</div>',
          back: '<div>Back</div>',
        },
      })

      // When no dragging state is injected, it should default to a ref(false)
      // Component should still be able to flip
      const cardElement = wrapperWithoutDrag.find('.flip-card')
      const inner = wrapperWithoutDrag.find('.flip-card__inner')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })
  })

  describe('event handling', () => {
    it('should respond to pointerup event by flipping', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      expect(inner.classes()).not.toContain('flip-card__inner--flipped')

      await cardElement.trigger('pointerup')
      await nextTick()

      expect(inner.classes()).toContain('flip-card__inner--flipped')
    })

    it('should respond to transitionend event by ending animation', async () => {
      const cardElement = wrapper.find('.flip-card')
      const inner = wrapper.find('.flip-card__inner')

      // Start flip
      await cardElement.trigger('pointerup')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(true)

      // End animation
      await inner.trigger('transitionend')
      await nextTick()
      expect(wrapper.vm.isAnimating).toBe(false)
    })
  })

  describe('component state', () => {
    it('should initialize with correct default state', () => {
      expect(wrapper.vm.isFlipped).toBe(false)
      expect(wrapper.vm.isAnimating).toBe(false)
    })

    it('should update internal state correctly during flip', async () => {
      const cardElement = wrapper.find('.flip-card')

      // Initial state
      expect(wrapper.vm.isFlipped).toBe(false)
      expect(wrapper.vm.isAnimating).toBe(false)

      // After flip
      await cardElement.trigger('pointerup')
      await nextTick()

      expect(wrapper.vm.isFlipped).toBe(true)
      expect(wrapper.vm.isAnimating).toBe(true)

      // After animation ends
      const inner = wrapper.find('.flip-card__inner')
      await inner.trigger('transitionend')
      await nextTick()

      expect(wrapper.vm.isFlipped).toBe(true)
      expect(wrapper.vm.isAnimating).toBe(false)
    })
  })
})
