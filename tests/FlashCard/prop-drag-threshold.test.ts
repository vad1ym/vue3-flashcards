import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] dragThreshold', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with custom dragThreshold', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          dragThreshold: 20, // Custom threshold of 20px
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should not start dragging when moved less than dragThreshold', async () => {
      // Move only 15px (less than 20px threshold)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 15 }])

      await wrapper.vm.$nextTick()

      // Should not be dragging yet
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should start dragging when moved equal to dragThreshold', async () => {
      // Move exactly 20px (equal to threshold)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 20 }])

      await wrapper.vm.$nextTick()

      // Should start dragging
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should start dragging when moved beyond dragThreshold', async () => {
      // Move 25px (more than 20px threshold)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 25 }])

      await wrapper.vm.$nextTick()

      // Should start dragging
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should use distance calculation for threshold (not just x coordinate)', async () => {
      // Move diagonally: 12px x + 16px y = 20px distance (pythagorean theorem)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 12, y: 16 }])

      await wrapper.vm.$nextTick()

      // Should start dragging since total distance is exactly 20px
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
    })
  })

  describe('with default dragThreshold', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {},
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should use default dragThreshold of 5px', async () => {
      // Move 4px (less than default 5px threshold)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 4 }])

      await wrapper.vm.$nextTick()

      // Should not be dragging yet
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)

      // Move 6px (more than default 5px threshold)
      new DragSimulator(cardElement)
        .reset()
        .dragStart()
        .dragMove([{ x: 6 }])

      await wrapper.vm.$nextTick()

      // Should start dragging
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
    })
  })
})
