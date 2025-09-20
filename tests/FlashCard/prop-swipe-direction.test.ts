import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] swipeDirection', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('default swipeDirection (horizontal)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeDirection: 'horizontal',
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should use horizontal as default swipeDirection', () => {
      expect(flashCardsDefaults.swipeDirection).toBe('horizontal')
    })

    it('should emit complete when swiped horizontally beyond threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })

    it('should not emit complete when swiped vertically beyond threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApproveVertical()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
    })

    it('should restore position when swiped horizontally below threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeRightBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })
  })

  describe('vertical swipeDirection', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeDirection: 'vertical',
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should accept vertical swipeDirection value', () => {
      expect(wrapper.props('swipeDirection')).toBe('vertical')
    })

    it('should emit complete when swiped vertically up beyond threshold (approve)', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApproveVertical()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })

    it('should emit complete when swiped vertically down beyond threshold (reject)', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeRejectVertical()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('reject')
    })

    it('should not emit complete when swiped horizontally beyond threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
    })

    it('should restore position when swiped vertically below threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeUpBelowThreshold()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeFalsy()
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should update position.delta based on vertical movement', async () => {
      const cardElement = wrapper.element

      // Test upward movement (positive delta - approve)
      const dragSimulatorUp = new DragSimulator(cardElement)
      dragSimulatorUp.dragUpToThreshold(0.5)
      await wrapper.vm.$nextTick()

      const position = wrapper.vm.position
      expect(position.delta).toBeGreaterThan(0)
      expect(position.type).toBe('approve')

      // End the drag to reset state
      dragSimulatorUp.dragEnd()
      await wrapper.vm.$nextTick()

      // Test downward movement (negative delta - reject)
      const dragSimulatorDown = new DragSimulator(cardElement)
      dragSimulatorDown.dragDownToThreshold(0.5)
      await wrapper.vm.$nextTick()

      expect(position.delta).toBeLessThan(0)
      expect(position.type).toBe('reject')
    })
  })

  describe('swipeDirection with custom swipeThreshold', () => {
    it('should work with custom swipeThreshold for vertical direction', async () => {
      const customThreshold = 200
      const verticalWrapper = mount(FlashCard, {
        props: {
          swipeDirection: 'vertical',
          swipeThreshold: customThreshold,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })

      // Wait for component to be fully mounted
      await verticalWrapper.vm.$nextTick()

      const cardElement = verticalWrapper.element

      new DragSimulator(cardElement, { swipeThreshold: customThreshold }).swipeApproveVertical()
      await verticalWrapper.vm.$nextTick()

      expect(verticalWrapper.emitted('complete')).toBeTruthy()
      expect(verticalWrapper.emitted('complete')?.[0][0]).toBe('approve')
    })
  })
})
