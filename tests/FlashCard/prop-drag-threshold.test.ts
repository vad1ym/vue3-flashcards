import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { flashCardsDefaults } from '../../src/config/flashcards.config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

const CUSTOM_DRAG_THRESHOLD_FOR_TESTING = 20
// For pythagorean theorem test: 12² + 16² = 20² (3-4-5 triangle scaled by 4)
const DIAGONAL_X_COMPONENT = 12
const DIAGONAL_Y_COMPONENT = 16

describe('[props] dragThreshold', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with custom dragThreshold', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          dragThreshold: CUSTOM_DRAG_THRESHOLD_FOR_TESTING, // Custom threshold
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should not start dragging when moved less than dragThreshold', async () => {
      new DragSimulator(cardElement, { threshold: CUSTOM_DRAG_THRESHOLD_FOR_TESTING })
        .dragRightBelowThreshold()

      await wrapper.vm.$nextTick()

      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)
      expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
    })

    it('should start dragging when moved equal to dragThreshold', async () => {
      new DragSimulator(cardElement, { threshold: CUSTOM_DRAG_THRESHOLD_FOR_TESTING })
        .dragRightToThreshold(1.0)

      await wrapper.vm.$nextTick()

      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should start dragging when moved beyond dragThreshold', async () => {
      new DragSimulator(cardElement, { threshold: CUSTOM_DRAG_THRESHOLD_FOR_TESTING })
        .dragRightBeyondThreshold()

      await wrapper.vm.$nextTick()

      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
      expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
    })

    it('should use distance calculation for threshold (not just x coordinate)', async () => {
      // Move diagonally: pythagorean theorem test
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: DIAGONAL_X_COMPONENT, y: DIAGONAL_Y_COMPONENT }])

      await wrapper.vm.$nextTick()

      // Should start dragging since total distance equals threshold
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

    it('should use default dragThreshold from config', async () => {
      new DragSimulator(cardElement, { threshold: flashCardsDefaults.dragThreshold })
        .dragRightBelowThreshold()

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(false)

      new DragSimulator(cardElement, { threshold: flashCardsDefaults.dragThreshold })
        .reset()
        .dragRightBeyondThreshold()

      await wrapper.vm.$nextTick()
      expect(cardElement.classList.contains('flash-card--dragging')).toBe(true)
    })
  })
})
