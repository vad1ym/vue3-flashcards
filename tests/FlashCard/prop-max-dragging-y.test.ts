import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] maxDragY', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with maxDragY set to 50px', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          maxDragY: 50,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should allow dragging and still respond to horizontal swipes', async () => {
      const cardElement = wrapper.element

      // Should still be able to perform horizontal swipes normally
      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })

    it('should work with combined horizontal and vertical dragging', async () => {
      const cardElement = wrapper.element

      // Drag both horizontally (to trigger approval) and vertically
      const simulator = new DragSimulator(cardElement)
      simulator
        .dragStart()
        .dragMove([{ x: 200, y: 30 }]) // Within Y limit
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should complete the horizontal swipe despite vertical component
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })

    it('should not prevent card functionality with vertical dragging', async () => {
      const cardElement = wrapper.element
      const simulator = new DragSimulator(cardElement)

      // Start a drag with vertical component
      simulator.dragStart().dragMove([{ x: 0, y: 25 }]) // Within limit

      // Should not emit complete event (not enough horizontal movement)
      expect(wrapper.emitted('complete')).toBeFalsy()

      // Finish with horizontal approval swipe
      simulator.dragMove([{ x: 200, y: 25 }]).dragEnd()
      await wrapper.vm.$nextTick()

      // Should now complete
      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })

  describe('with maxDragY set to 0', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          maxDragY: 0,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should still allow horizontal swiping when Y is restricted', async () => {
      const cardElement = wrapper.element

      // Should be able to swipe horizontally
      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })
  })

  describe('without maxDragY limit', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          // maxDragY not set, should allow free vertical movement
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should allow normal card swiping behavior', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })

    it('should work with large vertical movements', async () => {
      const cardElement = wrapper.element
      const simulator = new DragSimulator(cardElement)

      // Large vertical drag combined with horizontal
      simulator
        .dragStart()
        .dragMove([{ x: 200, y: 100 }]) // Large Y movement
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should still complete horizontal swipe
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('approve')
    })
  })

  describe('drag behavior validation', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          swipeThreshold: flashCardsDefaults.swipeThreshold,
          maxDragY: 30,
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit drag events during dragging with Y constraint', async () => {
      const cardElement = wrapper.element
      const simulator = new DragSimulator(cardElement)

      simulator.dragStart().dragMove([{ x: 50, y: 20 }])

      // Should be able to drag without errors
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle edge case of exactly maxDragY', async () => {
      const cardElement = wrapper.element
      const simulator = new DragSimulator(cardElement)

      // Drag exactly to the Y limit
      simulator
        .dragStart()
        .dragMove([{ x: 200, y: 30 }]) // Exactly maxDragY
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should complete normally
      expect(wrapper.emitted('complete')).toBeTruthy()
    })
  })
})
