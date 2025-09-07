import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { config } from '../../src/config'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] maxDraggingY', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  describe('with maxDraggingY set to 50px', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingY: 50, // Limit vertical dragging to 50px
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow dragging up to maxDraggingY limit', async () => {
      // Drag down 40px (within 50px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: 40 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(0px, 40px, 0)')
    })

    it('should clamp vertical dragging when exceeding positive maxDraggingY', async () => {
      // Try to drag down 80px (exceeds 50px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: 80 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to 50px
      expect(cardElement.style.transform).toContain('translate3D(0px, 50px, 0)')
    })

    it('should clamp vertical dragging when exceeding negative maxDraggingY', async () => {
      // Try to drag up -80px (exceeds -50px limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: -80 }])

      await wrapper.vm.$nextTick()

      // Should be clamped to -50px
      expect(cardElement.style.transform).toContain('translate3D(0px, -50px, 0)')
    })

    it('should still allow horizontal dragging when vertical is clamped', async () => {
      // Drag horizontally 100px and vertically 80px (vertical should be clamped)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 100, y: 80 }])

      await wrapper.vm.$nextTick()

      // Horizontal should be full, vertical should be clamped
      expect(cardElement.style.transform).toContain('translate3D(100px, 50px, 0)')
    })

    it('should work correctly during swipe completion', async () => {
      // Drag beyond threshold horizontally and vertically beyond limit
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: config.defaultThreshold + 10, y: 100 }]) // Exceed both threshold and Y limit
        .dragEnd()

      await wrapper.vm.$nextTick()

      // Should complete the swipe and emit event
      expect(wrapper.emitted('complete')).toBeTruthy()
      expect(wrapper.emitted('complete')?.[0]).toEqual([true])
    })
  })

  describe('with maxDraggingY disabled (null)', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      wrapper = mount(FlashCard, {
        props: {
          maxDraggingY: null, // Explicitly disable Y limit
        },
        slots: {
          default: '<div class="card-content">Test Card</div>',
        },
        global: { stubs: { Transition: false } },
      })
      cardElement = wrapper.element
    })

    it('should allow unlimited vertical dragging when maxDraggingY is null', async () => {
      // Drag down 200px (no limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: 200 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(0px, 200px, 0)')
    })

    it('should allow unlimited upward dragging when maxDraggingY is null', async () => {
      // Drag up -200px (no limit)
      new DragSimulator(cardElement)
        .dragStart()
        .dragMove([{ x: 0, y: -200 }])

      await wrapper.vm.$nextTick()

      // Should allow full movement
      expect(cardElement.style.transform).toContain('translate3D(0px, -200px, 0)')
    })
  })
})
