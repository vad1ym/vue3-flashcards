import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] direction', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('default direction (horizontal)', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          direction: ['left', 'right'],
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should emit complete when swiped horizontally beyond threshold', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApprove()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('right')
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

  describe('vertical direction', () => {
    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          direction: ['top', 'bottom'],
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
    })

    it('should accept vertical direction value', () => {
      expect(wrapper.props('direction')).toEqual(['top', 'bottom'])
    })

    it('should emit complete when swiped vertically up beyond threshold (top)', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeApproveVertical()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('top')
    })

    it('should emit complete when swiped vertically down beyond threshold (bottom)', async () => {
      const cardElement = wrapper.element

      new DragSimulator(cardElement).swipeRejectVertical()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0][0]).toBe('bottom')
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

      // Test upward movement (positive delta - top)
      const dragSimulatorUp = new DragSimulator(cardElement)
      dragSimulatorUp.dragUpToThreshold(0.5)
      await wrapper.vm.$nextTick()

      const position = wrapper.vm.position
      expect(position.delta).toBeGreaterThan(0)
      expect(position.type).toBe('top')

      // End the drag to reset state
      dragSimulatorUp.dragEnd()
      await wrapper.vm.$nextTick()

      // Test downward movement (negative delta - bottom)
      const dragSimulatorDown = new DragSimulator(cardElement)
      dragSimulatorDown.dragDownToThreshold(0.5)
      await wrapper.vm.$nextTick()

      expect(position.delta).toBeLessThan(0)
      expect(position.type).toBe('bottom')
    })
  })

  describe('direction with custom swipeThreshold', () => {
    it('should work with custom swipeThreshold for vertical direction', async () => {
      const customThreshold = 200
      const verticalWrapper = mount(FlashCard, {
        props: {
          direction: ['top', 'bottom'],
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
      expect(verticalWrapper.emitted('complete')?.[0][0]).toBe('top')
    })
  })
})
