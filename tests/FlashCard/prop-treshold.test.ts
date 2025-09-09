import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import FlashCard from '../../src/FlashCard.vue'
import { DragSimulator } from '../utils/drag-simular'

describe('[props] threshold', () => {
  let wrapper: VueWrapper<InstanceType<typeof FlashCard>>

  beforeEach(() => {
    wrapper = mount(FlashCard, {
      props: {},
      slots: {
        default: '<div class="card-content">Test Card</div>',
      },

      global: { stubs: { Transition: false } }, // To disable transition animation
    })
  })

  describe('default', () => {
    let cardElement: HTMLElement

    beforeEach(() => {
      cardElement = wrapper.element
    })

    describe('when swiped beyond threshold', () => {
      it('should emit complete with true when swiped right', async () => {
        new DragSimulator(cardElement).swipeApprove()

        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('complete')).toBeTruthy()
        expect(wrapper.emitted('complete')?.[0]).toEqual([true])
        expect(cardElement.style.transform).not.toContain('translate3D(0px, 0px, 0)')
      })

      it('should emit complete with false when swiped left', async () => {
        new DragSimulator(cardElement).swipeReject()

        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('complete')).toBeTruthy()
        expect(wrapper.emitted('complete')?.[0]).toEqual([false])
      })
    })

    describe('when swiped below threshold', () => {
      it('should restore card position without event when swiped right', async () => {
        new DragSimulator(cardElement).swipeRightBelowThreshold()

        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('complete')).toBeFalsy()
        expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
      })

      it('should restore card position without event when swiped left', async () => {
        new DragSimulator(cardElement).swipeLeftBelowThreshold()

        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('complete')).toBeFalsy()
        expect(cardElement.style.transform).toContain('translate3D(0px, 0px, 0)')
      })
    })
  })
})
